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

// Safely parse response — handle empty body
async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    console.error("[moka-checkout] Non-JSON response:", text);
    return { _raw: text };
  }
}

export const handler = async (event) => {
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
    let parsed;
    try {
      parsed = JSON.parse(event.body || "{}");
    } catch (e) {
      console.error("[moka-checkout] Failed to parse body:", event.body);
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { checkout } = parsed;
    if (!checkout) {
      console.error("[moka-checkout] Missing checkout in body");
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing checkout payload" }),
      };
    }

    const outletId = process.env.MOKA_OUTLET_ID;
    if (!outletId) {
      console.error("[moka-checkout] MOKA_OUTLET_ID not set");
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }),
      };
    }

    const token = await getValidToken();
    const url   = `${MOKA_BASE}/v1/outlets/${outletId}/checkouts`;

    console.log("[moka-checkout] POST", url);

    const res  = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ checkout }),
    });

    const data = await safeJson(res);
    console.log("[moka-checkout] status:", res.status, "body:", JSON.stringify(data));

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error:  data?.meta?.errors || data?.error_description || data?.error || `Moka error ${res.status}`,
          detail: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[moka-checkout] Unhandled error:", err.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};