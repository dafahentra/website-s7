// netlify/functions/moka-checkout.js
const MOKA_BASE = "https://api.mokapos.com";

let _cache = null;

async function persistRefreshToken(newToken) {
  const apiToken = process.env.NETLIFY_API_TOKEN;
  const siteId   = process.env.NETLIFY_SITE_ID;
  if (!apiToken || !siteId) return;

  try {
    await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/MOKA_REFRESH_TOKEN`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        key: "MOKA_REFRESH_TOKEN",
        values: [{ context: "all", value: newToken }],
      }),
    });
  } catch (e) {
    console.error("[moka-checkout] Failed to persist refresh token:", e.message);
  }
}

async function getValidToken() {
  // Pakai cached token jika masih valid
  if (_cache && Date.now() < _cache.expires_at) return _cache.access_token;

  // Seed cache dari env vars jika belum ada cache sama sekali
  // Ini mencegah refresh yang tidak perlu saat access token masih valid
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: refreshToken,
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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { checkout } = JSON.parse(event.body || "{}");
    if (!checkout) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing checkout payload" }) };
    }

    const token    = await getValidToken();
    const outletId = process.env.MOKA_OUTLET_ID;

    if (!outletId) {
      return { statusCode: 500, body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }) };
    }

    const res = await fetch(`${MOKA_BASE}/v1/outlets/${outletId}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ checkout }),
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};