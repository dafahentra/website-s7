// netlify/functions/moka-checkout.js
// Pure Moka API proxy — submit order ke Moka Advanced Ordering.
//
// NEW ARCH: Blobs sudah disimpan oleh frontend (save-pending-order).
// Function ini TIDAK menyimpan ke Blobs lagi.
//
// Dipanggil oleh:
//   1. Frontend — free order (finalPrice=0), dengan price_context untuk validasi
//   2. midtrans-notify — paid order setelah settlement

const MOKA_BASE = "https://api.mokapos.com";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const safeJson = async (res) => {
  try { return await res.json(); } catch { return null; }
};

// ─── Online Fee Rules (mirror dari src/utils/onlineFee.js) ───────────────────
const ONLINE_FEE_RULES = [
  { maxAmount: 49999, fee: 500  },
  { maxAmount: Infinity, fee: 1000 },
];

function calcOnlineFee(amountAfterDiscount) {
  const amt  = Math.max(0, Number(amountAfterDiscount) || 0);
  const rule = ONLINE_FEE_RULES.find((r) => amt <= r.maxAmount);
  return rule ? rule.fee : 0;
}

function stripEmoji(str) {
  return String(str).replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u200D\uFE0F]/gu, "").trim();
}

async function ntfy(title, message, priority = 5, tags = "warning") {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Title":        stripEmoji(title).slice(0, 250),
        "Priority":     String(priority),
        "Tags":         tags,
      },
      body: String(message).slice(0, 4096),
    });
  } catch (e) {
    console.error("[moka-checkout][ntfy]", e.message);
  }
}

// ─── Token Cache ─────────────────────────────────────────────────────────────
let _cache = null;

async function persistRefreshToken(newToken) {
  const apiToken = process.env.NETLIFY_API_TOKEN;
  const siteId   = process.env.NETLIFY_SITE_ID;
  if (!apiToken || !siteId) return;
  try {
    await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/env/MOKA_REFRESH_TOKEN`,
      {
        method:  "PUT",
        headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ key: "MOKA_REFRESH_TOKEN", values: [{ context: "all", value: newToken }] }),
      }
    );
  } catch (e) {
    console.error("[moka-checkout] Failed to persist refresh token:", e.message);
  }
}

async function getValidToken() {
  if (_cache && Date.now() < _cache.expires_at) return _cache.access_token;

  if (!_cache && process.env.MOKA_ACCESS_TOKEN) {
    _cache = {
      access_token: process.env.MOKA_ACCESS_TOKEN,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
      expires_at: Date.now() + (15552000 - 60) * 1000,
    };
    return _cache.access_token;
  }

  const refreshToken = _cache?.refresh_token || process.env.MOKA_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("MOKA_REFRESH_TOKEN not set");

  const res = await fetch(`${MOKA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token", client_id: process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET, refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error || `Token refresh failed: ${res.status}`);

  const newRefreshToken = data.refresh_token || refreshToken;
  _cache = {
    access_token: data.access_token, refresh_token: newRefreshToken,
    expires_at: Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  if (data.refresh_token && data.refresh_token !== refreshToken) persistRefreshToken(data.refresh_token);
  return _cache.access_token;
}

function validateOrder(order) {
  if (!order || typeof order !== "object") return "order payload missing";
  if (!order.application_order_id) return "application_order_id missing";
  if (!Array.isArray(order.order_items) || order.order_items.length === 0) return "order_items empty";
  const badIdx = order.order_items.findIndex((i) => !i.item_id);
  if (badIdx !== -1) return `order_items[${badIdx}].item_id null (${order.order_items[badIdx]?.item_name || "?"})`;
  return null;
}

async function validateFreeOrder(order, priceContext, mokaToken) {
  const outletId = process.env.MOKA_OUTLET_ID;

  const serverSubtotal = (order.order_items || []).reduce((sum, item) => {
    const basePrice = Number(item.item_price_library) || 0;
    const modSum = (item.item_modifiers || []).reduce((ms, m) => ms + (Number(m.item_modifier_option_price) || 0), 0);
    return sum + (basePrice + modSum) * (Number(item.quantity) || 1);
  }, 0);

  let serverDiscountAmount = 0;
  if (order.discount_id) {
    try {
      const discRes = await fetch(`${MOKA_BASE}/v1/outlets/${outletId}/discounts?per_page=200`,
        { headers: { Authorization: `Bearer ${mokaToken}` } });
      const discounts = (await safeJson(discRes))?.data?.discount ?? [];
      const matched = discounts.find((d) => !d.is_deleted && d.id === order.discount_id);
      if (!matched) return { valid: false, reason: `discount_id ${order.discount_id} tidak ditemukan` };
      const amount = Number(matched.amount) || 0;
      serverDiscountAmount = matched.type === "percentage"
        ? Math.round((serverSubtotal * amount) / 100)
        : Math.min(amount, serverSubtotal);
    } catch (err) {
      return { valid: false, reason: `Gagal query diskon: ${err.message}` };
    }
  }

  const afterDiscount = Math.max(0, serverSubtotal - serverDiscountAmount);
  const serverOnlineFee = calcOnlineFee(afterDiscount);
  const serverFinalPrice = afterDiscount + serverOnlineFee;

  console.log(`[price-validate] sub=${serverSubtotal} disc=${serverDiscountAmount} fee=${serverOnlineFee} final=${serverFinalPrice}`);

  if (serverFinalPrice > 0) {
    return { valid: false, reason: `finalPrice=Rp${serverFinalPrice}. Harus bayar.`, serverFinalPrice, serverOnlineFee };
  }
  return { valid: true, serverFinalPrice: 0, serverOnlineFee: 0 };
}

function redactPayload(order) {
  if (!order) return order;
  const copy = { ...order };
  if (copy.customer_name) copy.customer_name = "[REDACTED]";
  if (copy.customer_phone_number) copy.customer_phone_number = `***${String(copy.customer_phone_number).slice(-3)}`;
  if (copy.customer_address_detail) copy.customer_address_detail = "[REDACTED]";
  ["accept_order_notification_url","complete_order_notification_url","cancel_order_notification_url"]
    .forEach((k) => { if (copy[k]) copy[k] = copy[k].replace(/([?&])(phone|name)=[^&]*/g, "$1$2=[REDACTED]"); });
  return copy;
}

function maskPhone(phone) { const s = String(phone || ""); return s ? `***${s.slice(-3)}` : "(no phone)"; }
function summarizeItems(items) { return (items || []).map((i) => `${i.quantity}x ${i.item_name}`).join(", "); }

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };

  let order;
  try {
    const parsed = JSON.parse(event.body || "{}");
    order = parsed.order;
    const priceContext = parsed.price_context || null;

    const validationError = validateOrder(order);
    if (validationError) {
      console.error("[moka-checkout] validation failed:", validationError);
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: validationError }) };
    }

    const outletId = process.env.MOKA_OUTLET_ID;
    if (!outletId) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }) };

    const token = await getValidToken();

    // ── [SECURITY] Validasi free order ───────────────────────────────────
    if (priceContext?.isFreeOrder === true) {
      console.log(`[moka-checkout] Free order claimed: ${order.application_order_id}`);
      const verdict = await validateFreeOrder(order, priceContext, token);
      if (!verdict.valid) {
        console.error(`[moka-checkout] FREE ORDER REJECTED: ${verdict.reason}`);
        ntfy(`Free Order DITOLAK: ${order.application_order_id}`,
          `Order: ${order.application_order_id}\nCustomer: ${maskPhone(order.customer_phone_number)}\nReason: ${verdict.reason}`,
          5, "rotating_light,shield");
        return { statusCode: 403, headers: corsHeaders,
          body: JSON.stringify({ error: "Order tidak gratis. Silakan bayar.", serverFinalPrice: verdict.serverFinalPrice }) };
      }
      console.log(`[moka-checkout] Free order VALID`);
    }

    // ── Submit ke Moka ───────────────────────────────────────────────────
    const url = `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders`;
    console.log("[moka-checkout] POST", url, "order=", order.application_order_id);
    console.log("[moka-checkout] payload:", JSON.stringify(redactPayload(order)));

    const res  = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await safeJson(res);
    console.log("[moka-checkout] status:", res.status, "order=", order.application_order_id);

    if (!res.ok) {
      const errMsg = data?.meta?.error_message || data?.error_description || data?.error || `Moka error ${res.status}`;
      console.error("[moka-checkout] ERROR:", errMsg);
      const isDuplicate = errMsg.toLowerCase().includes("duplicate");
      if (!isDuplicate) {
        ntfy(`Moka submit FAILED: ${order.application_order_id}`,
          `Items: ${summarizeItems(order.order_items)}\nHTTP ${res.status}: ${errMsg}`, 5, "warning,moka");
      }
      return { statusCode: res.status, headers: corsHeaders, body: JSON.stringify({ error: errMsg, detail: data }) };
    }

    // ── TIDAK ada save-pending-order di sini ─────────────────────────────
    // Blobs sudah disimpan oleh frontend (paid) atau frontend (free).
    // midtrans-notify akan update Blobs setelah settlement.

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (err) {
    console.error("[moka-checkout] Unhandled error:", err.message);
    ntfy(`Moka checkout EXCEPTION`, `Order: ${order?.application_order_id || "?"}\nError: ${err.message}`, 5, "rotating_light,moka");
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};