// netlify/functions/moka-checkout.js
// POST /v1/outlets/{outlet_id}/advanced_orderings/orders
//
// Catatan flow:
//   - Function ini dipanggil 2x dalam siklus order:
//     1. Frontend (useMokaCheckout) — submit order ke Moka SEBELUM Midtrans dibuka
//     2. midtrans-notify (webhook) — submit ulang setelah payment confirmed
//        (handle "duplicate" sebagai sukses untuk idempotency)
//
// Perubahan:
//   1. validateOrder() — tolak payload invalid sebelum hit Moka API.
//   2. redactPayload() — PII (nama/phone) tidak muncul plain-text di log Netlify.
//   3. ntfy alert (inline) kalau Moka response error.
//   4. [SECURITY] validateFreeOrder() — server-side recalculation untuk free order.
//   5. [FIX] final_price dari frontend disimpan sebagai clientFinalPrice di Blobs.
//      Ini mencegah race condition: moka-callback fire sebelum midtrans-notify
//      → grossAmount null → refund/loyalty gagal.

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
// ⚠️ SYNC MANUAL: Kalau ubah fee di frontend, HARUS update di sini juga.
const ONLINE_FEE_RULES = [
  { maxAmount: 49999, fee: 500  },
  { maxAmount: Infinity, fee: 1000 },
];

function calcOnlineFee(amountAfterDiscount) {
  const amt  = Math.max(0, Number(amountAfterDiscount) || 0);
  const rule = ONLINE_FEE_RULES.find((r) => amt <= r.maxAmount);
  return rule ? rule.fee : 0;
}

// ─── ntfy inline helper ──────────────────────────────────────────────────────
async function ntfy(title, message, priority = 5, tags = "warning") {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Title":        String(title).slice(0, 250),
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
        headers: {
          Authorization:  `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key:    "MOKA_REFRESH_TOKEN",
          values: [{ context: "all", value: newToken }],
        }),
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
      access_token:  process.env.MOKA_ACCESS_TOKEN,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
      expires_at:    Date.now() + (15552000 - 60) * 1000,
    };
    return _cache.access_token;
  }

  const refreshToken = _cache?.refresh_token || process.env.MOKA_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("MOKA_REFRESH_TOKEN not set");

  const res = await fetch(`${MOKA_BASE}/oauth/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `Token refresh failed: ${res.status}`);
  }

  const newRefreshToken = data.refresh_token || refreshToken;

  _cache = {
    access_token:  data.access_token,
    refresh_token: newRefreshToken,
    expires_at:    Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    persistRefreshToken(data.refresh_token);
  }

  return _cache.access_token;
}

// ─── Order Payload Validator ─────────────────────────────────────────────────
function validateOrder(order) {
  if (!order || typeof order !== "object") return "order payload missing";
  if (!order.application_order_id) return "application_order_id missing";
  if (!Array.isArray(order.order_items) || order.order_items.length === 0) {
    return "order_items empty";
  }

  const badIdx = order.order_items.findIndex((i) => !i.item_id);
  if (badIdx !== -1) {
    const badName = order.order_items[badIdx]?.item_name || "?";
    return `order_items[${badIdx}].item_id null (${badName})`;
  }

  return null;
}

// ─── [SECURITY] Server-side Free Order Validation ────────────────────────────
async function validateFreeOrder(order, priceContext, mokaToken) {
  const outletId = process.env.MOKA_OUTLET_ID;

  // 1. Hitung subtotal dari order_items
  const serverSubtotal = (order.order_items || []).reduce((sum, item) => {
    const basePrice = Number(item.item_price_library) || 0;
    const modSum    = (item.item_modifiers || []).reduce(
      (ms, m) => ms + (Number(m.item_modifier_option_price) || 0), 0
    );
    return sum + (basePrice + modSum) * (Number(item.quantity) || 1);
  }, 0);

  // 2. Validasi diskon ke Moka API
  let serverDiscountAmount = 0;

  if (order.discount_id) {
    try {
      const discRes = await fetch(
        `${MOKA_BASE}/v1/outlets/${outletId}/discounts?per_page=200`,
        { headers: { Authorization: `Bearer ${mokaToken}` } }
      );
      const discData = await safeJson(discRes);
      const discounts = discData?.data?.discount ?? [];

      const matched = discounts.find(
        (d) => !d.is_deleted && d.id === order.discount_id
      );

      if (!matched) {
        return {
          valid:  false,
          reason: `discount_id ${order.discount_id} tidak ditemukan / sudah dihapus di Moka`,
        };
      }

      const amount = Number(matched.amount) || 0;
      if (matched.type === "percentage") {
        serverDiscountAmount = Math.round((serverSubtotal * amount) / 100);
      } else {
        serverDiscountAmount = Math.min(amount, serverSubtotal);
      }

      console.log(
        `[price-validate] Diskon "${matched.name}" (${matched.type} ${amount}) → Rp${serverDiscountAmount}`
      );
    } catch (err) {
      console.error("[price-validate] Gagal validasi diskon:", err.message);
      return { valid: false, reason: `Gagal query diskon Moka: ${err.message}` };
    }
  }

  // 3. Hitung online fee + final price
  const afterDiscount   = Math.max(0, serverSubtotal - serverDiscountAmount);
  const serverOnlineFee = calcOnlineFee(afterDiscount);
  const serverFinalPrice = afterDiscount + serverOnlineFee;

  console.log(
    `[price-validate] subtotal=${serverSubtotal} disc=${serverDiscountAmount} ` +
    `afterDisc=${afterDiscount} fee=${serverOnlineFee} final=${serverFinalPrice}`
  );

  if (serverFinalPrice > 0) {
    return {
      valid:            false,
      reason:           `Server: finalPrice=Rp${serverFinalPrice} (sub=${serverSubtotal} disc=${serverDiscountAmount} fee=${serverOnlineFee}). Harus bayar via Midtrans.`,
      serverFinalPrice,
      serverOnlineFee,
    };
  }

  return { valid: true, serverFinalPrice: 0, serverOnlineFee: 0 };
}

// ─── PII Redaction ───────────────────────────────────────────────────────────
function redactPayload(order) {
  if (!order) return order;
  const copy = { ...order };

  if (copy.customer_name)         copy.customer_name = "[REDACTED]";
  if (copy.customer_phone_number) copy.customer_phone_number = `***${String(copy.customer_phone_number).slice(-3)}`;
  if (copy.customer_address_detail) copy.customer_address_detail = "[REDACTED]";

  [
    "accept_order_notification_url",
    "complete_order_notification_url",
    "cancel_order_notification_url",
  ].forEach((k) => {
    if (copy[k]) {
      copy[k] = copy[k].replace(/([?&])(phone|name)=[^&]*/g, "$1$2=[REDACTED]");
    }
  });

  return copy;
}

function maskPhone(phone) {
  const s = String(phone || "");
  return s ? `***${s.slice(-3)}` : "(no phone)";
}

function summarizeItems(orderItems) {
  return (orderItems || []).map((i) => `${i.quantity}x ${i.item_name}`).join(", ");
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };

  let order;
  try {
    const parsed = JSON.parse(event.body || "{}");
    order = parsed.order;
    const priceContext = parsed.price_context || null;

    // final_price dari frontend — disimpan di Blobs sebagai fallback
    // untuk moka-callback jika grossAmount belum ada dari midtrans-notify.
    const clientFinalPrice = typeof parsed.final_price === "number"
      ? parsed.final_price
      : null;

    // ── 1. Validasi payload ──────────────────────────────────────────────
    const validationError = validateOrder(order);
    if (validationError) {
      console.error("[moka-checkout] validation failed:", validationError);
      return {
        statusCode: 400, headers: corsHeaders,
        body: JSON.stringify({ error: validationError }),
      };
    }

    const outletId = process.env.MOKA_OUTLET_ID;
    if (!outletId) {
      return {
        statusCode: 500, headers: corsHeaders,
        body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }),
      };
    }

    const token = await getValidToken();

    // ── 1b. [SECURITY] Validasi harga untuk free order ───────────────────
    if (priceContext?.isFreeOrder === true) {
      console.log(`[moka-checkout] Free order claimed: ${order.application_order_id} — validating...`);

      const verdict = await validateFreeOrder(order, priceContext, token);

      if (!verdict.valid) {
        console.error(`[moka-checkout] FREE ORDER REJECTED: ${verdict.reason}`);

        ntfy(
          `🚫 Free Order DITOLAK: ${order.application_order_id}`,
          [
            `Order: ${order.application_order_id}`,
            `Customer: ${maskPhone(order.customer_phone_number)}`,
            `Items: ${summarizeItems(order.order_items)}`,
            `Reason: ${verdict.reason}`,
            "",
            "Kemungkinan manipulasi client-side atau fee rules berubah.",
          ].join("\n"),
          5,
          "rotating_light,shield"
        );

        return {
          statusCode: 403,
          headers:    corsHeaders,
          body: JSON.stringify({
            error:            "Order ini tidak gratis. Silakan lakukan pembayaran.",
            serverFinalPrice: verdict.serverFinalPrice,
            serverOnlineFee:  verdict.serverOnlineFee,
          }),
        };
      }

      console.log(`[moka-checkout] Free order VALID: ${order.application_order_id}`);
    }

    const url = `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders`;

    // ── 2. Log request (PII-redacted) ────────────────────────────────────
    console.log("[moka-checkout] POST", url, "order=", order.application_order_id);
    console.log("[moka-checkout] payload:", JSON.stringify(redactPayload(order)));

    // ── 3. Submit ke Moka ────────────────────────────────────────────────
    const res  = await fetch(url, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(order),
    });
    const data = await safeJson(res);
    console.log("[moka-checkout] status:", res.status, "order=", order.application_order_id);

    if (!res.ok) {
      const errMsg = data?.meta?.error_message || data?.error_description || data?.error || `Moka error ${res.status}`;
      console.error("[moka-checkout] ERROR:", errMsg);

      const isDuplicate = errMsg.toLowerCase().includes("duplicate");
      if (!isDuplicate) {
        ntfy(
          `⚠️ Moka submit FAILED: ${order.application_order_id}`,
          [
            `Order: ${order.application_order_id}`,
            `Customer: ${maskPhone(order.customer_phone_number)}`,
            `Items: ${summarizeItems(order.order_items)}`,
            `Status: HTTP ${res.status}`,
            `Error: ${errMsg}`,
            "",
            "Cek apakah dari frontend (customer belum bayar) atau dari midtrans-notify",
            "(customer sudah bayar — auto-refund harusnya jalan).",
          ].join("\n"),
          5,
          "warning,moka"
        );
      }

      return {
        statusCode: res.status, headers: corsHeaders,
        body: JSON.stringify({ error: errMsg, detail: data }),
      };
    }

    // ── 4. Simpan pending order ke Blobs (fire-and-forget) ───────────────
    // clientFinalPrice disimpan agar moka-callback punya fallback
    // jika grossAmount belum ditulis oleh midtrans-notify.
    const siteUrl = process.env.URL || "https://sectorseven.space";
    fetch(`${siteUrl}/.netlify/functions/save-pending-order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId:      order.application_order_id,
        orderPayload: order,
        clientFinalPrice,
        customerPhone: order.customer_phone_number
          ? order.customer_phone_number.replace(/^\+/, "").replace(/^0/, "62")
          : null,
        customerName: order.customer_name || "Pelanggan",
        items: (order.order_items || []).map((i) => ({
          name: i.item_name || "",
          qty:  i.quantity  || 1,
        })),
      }),
    }).catch((e) => console.error("[moka-checkout] save-pending-order failed:", e.message));

    return {
      statusCode: 200,
      headers:    { ...corsHeaders, "Content-Type": "application/json" },
      body:       JSON.stringify(data),
    };

  } catch (err) {
    console.error("[moka-checkout] Unhandled error:", err.message);

    ntfy(
      `🔴 Moka checkout EXCEPTION`,
      [
        `Order: ${order?.application_order_id || "(unknown)"}`,
        `Error: ${err.message}`,
        "",
        "Cek log Netlify untuk detail.",
      ].join("\n"),
      5,
      "rotating_light,moka"
    );

    return {
      statusCode: 500, headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};