// netlify/functions/moka-items.js
const MOKA_BASE = "https://api.mokapos.com";

let _cache = null;

async function getValidToken() {
  if (_cache && Date.now() < _cache.expires_at) return _cache.access_token;

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

  _cache = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at:    Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  return _cache.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const token    = await getValidToken();
    const outletId = process.env.MOKA_OUTLET_ID;

    if (!outletId) {
      return { statusCode: 500, body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }) };
    }

    const res = await fetch(
      `${MOKA_BASE}/v1/outlets/${outletId}/items?per_page=200&include_deleted=false`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type":  "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data?.meta?.error_message || `Moka API error ${res.status}` }),
      };
    }

    const items = data?.data?.items ?? data?.data?.item ?? [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ items }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};