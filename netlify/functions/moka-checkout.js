// netlify/functions/moka-checkout.js
// POST /v1/outlets/{outlet_id}/advanced_orderings/orders
//
// Perubahan utama:
// 1. validateOrder() — tolak payload invalid sebelum hit Moka API.
// 2. redactPayload() — PII (nama/phone) tidak muncul plain-text di log Netlify.
// 3. Log hanya application_order_id + status code untuk audit trail.

const MOKA_BASE = "https://api.mokapos.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// ─── Token Cache ─────────────────────────────────────────────────────────────
let _cache = null;

async function persistRefreshToken(newToken) {
  const apiToken = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;
  if (!apiToken || !siteId) return;
  try {
    await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/env/MOKA_REFRESH_TOKEN`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "MOKA_REFRESH_TOKEN",
          values: [{ context: "all", value: newToken }],
        }),
      }
    );
  } catch (e) {
    console.error(
      "[moka-checkout] Failed to persist refresh token:",
      e.message
    );
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
      grant_type: "refresh_token",
      client_id: process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        `Token refresh failed: ${res.status}`
    );
  }

  const newRefreshToken = data.refresh_token || refreshToken;

  _cache = {
    access_token: data.access_token,
    refresh_token: newRefreshToken,
    expires_at: Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    persistRefreshToken(data.refresh_token);
  }

  return _cache.access_token;
}

// ─── Validator ───────────────────────────────────────────────────────────────
// Tolak payload invalid sebelum hit Moka API.
// Hemat waktu request + pesan error lebih jelas untuk frontend.
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

// ─── PII Redaction ───────────────────────────────────────────────────────────
// Hapus / masking PII sebelum payload muncul di console.log.
// Log Netlify bisa dilihat siapa saja yang punya akses dashboard.
function redactPayload(order) {
  if (!order) return order;
  const copy = { ...order };

  if (copy.customer_name) copy.customer_name = "[REDACTED]";
  if (copy.customer_phone_number) {
    copy.customer_phone_number = `***${String(
      copy.customer_phone_number
    ).slice(-3)}`;
  }
  if (copy.customer_address_detail) copy.customer_address_detail = "[REDACTED]";

  // URL notifikasi juga mengandung phone/name di query string → redact juga
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

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const parsed = JSON.parse(event.body || "{}");
    const { order } = parsed;

    // ── 1. Validasi payload ──────────────────────────────────────────────
    const validationError = validateOrder(order);
    if (validationError) {
      console.error("[moka-checkout] validation failed:", validationError);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: validationError }),
      };
    }

    const outletId = process.env.MOKA_OUTLET_ID;
    if (!outletId) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }),
      };
    }

    const token = await getValidToken();
    const url = `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders`;

    // ── 2. Log request (PII-redacted) ────────────────────────────────────
    console.log(
      "[moka-checkout] POST",
      url,
      "order=",
      order.application_order_id
    );
    console.log(
      "[moka-checkout] payload:",
      JSON.stringify(redactPayload(order))
    );

    // ── 3. Submit ke Moka ────────────────────────────────────────────────
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const data = await safeJson(res);
    console.log(
      "[moka-checkout] status:",
      res.status,
      "order=",
      order.application_order_id
    );

    if (!res.ok) {
      const errMsg =
        data?.meta?.error_message ||
        data?.error_description ||
        data?.error ||
        `Moka error ${res.status}`;
      console.error("[moka-checkout] ERROR:", errMsg);
      return {
        statusCode: res.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: errMsg, detail: data }),
      };
    }

    // ── 4. Simpan pending order ke Blobs (fire-and-forget) ───────────────
    // Dipakai oleh midtrans-notify saat settlement payment.
    const siteUrl = process.env.URL || "https://sectorseven.space";
    fetch(`${siteUrl}/.netlify/functions/save-pending-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.application_order_id,
        orderPayload: order,
        customerPhone: order.customer_phone_number
          ? order.customer_phone_number.replace(/^\+/, "").replace(/^0/, "62")
          : null,
        customerName: order.customer_name || "Pelanggan",
        items: (order.order_items || []).map((i) => ({
          name: i.item_name || "",
          qty: i.quantity || 1,
        })),
      }),
    }).catch((e) =>
      console.error("[moka-checkout] save-pending-order failed:", e.message)
    );

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[moka-checkout] Unhandled error:", err.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};