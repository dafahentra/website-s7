// netlify/functions/moka-checkout.js
// Advanced Ordering API: POST /v1/outlets/{outlet_id}/advanced_orderings/orders


const MOKA_BASE = "https://api.mokapos.com";

let _cache = null;

async function persistRefreshToken(newToken) {
  const apiToken = process.env.NETLIFY_API_TOKEN;
  const siteId   = process.env.NETLIFY_SITE_ID;
  if (!apiToken || !siteId) return;
  try {
    await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/MOKA_REFRESH_TOKEN`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ key: "MOKA_REFRESH_TOKEN", values: [{ context: "all", value: newToken }] }),
    });
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

  const res  = await fetch(`${MOKA_BASE}/oauth/token`, {
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
    access_token:  data.access_token,
    refresh_token: newRefreshToken,
    expires_at:    Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    persistRefreshToken(data.refresh_token);
  }
  return _cache.access_token;
}

async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === "") return {};
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { order } = JSON.parse(event.body || "{}");
    if (!order) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing order payload" }) };

    const outletId = process.env.MOKA_OUTLET_ID;
    if (!outletId) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }) };

    const token = await getValidToken();
    const url   = `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders`;

    // Log payload lengkap untuk debugging
    console.log("[moka-checkout] POST", url);
    console.log("[moka-checkout] payload:", JSON.stringify(order, null, 2));

    const res  = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    const data = await safeJson(res);
    console.log("[moka-checkout] status:", res.status);
    console.log("[moka-checkout] response:", JSON.stringify(data));

    if (!res.ok) {
      const errMsg = data?.meta?.error_message || data?.error_description || data?.error || `Moka error ${res.status}`;
      console.error("[moka-checkout] ERROR:", errMsg);
      return {
        statusCode: res.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: errMsg, detail: data }),
      };
    }


    // Simpan customer data ke Blobs via save-customer function
    if (order.customer_phone_number) {
      const siteUrl = process.env.URL || "https://sectorseven.space";
      fetch(`${siteUrl}/.netlify/functions/save-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    order.customer_name         || "",
          phone:   order.customer_phone_number || "",
          orderId: order.application_order_id  || "",
          total:   order.order_items?.reduce((s, i) => s + (i.item_price_library * i.quantity), 0) || 0,
        }),
      }).catch((e) => console.error("[moka-checkout] save-customer failed:", e.message));
    }

    return { statusCode: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify(data) };

  } catch (err) {
    console.error("[moka-checkout] Unhandled error:", err.message);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};