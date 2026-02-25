// netlify/functions/moka-token.js
// Gets a fresh access_token using the stored refresh_token.
// Called internally by moka-items.js and moka-checkout.js.
// REQUIRES env vars: MOKA_CLIENT_ID, MOKA_SECRET, MOKA_REFRESH_TOKEN

const MOKA_BASE = "https://api.mokapos.com";

// In-memory token cache (lives for duration of function instance warmth)
let _cache = null;

async function getValidToken() {
  // Use cached token if still valid (with 60s buffer)
  if (_cache && Date.now() < _cache.expires_at) {
    return _cache.access_token;
  }

  const refreshToken = process.env.MOKA_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error(
      "MOKA_REFRESH_TOKEN not set. Run the setup at /moka-setup to authorize first."
    );
  }

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

  if (!res.ok) {
    throw new Error(
      data?.error_description || data?.error || `Token refresh failed: ${res.status}`
    );
  }

  _cache = {
    access_token: data.access_token,
    // expires_in is in seconds; subtract 60s buffer
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };

  return _cache.access_token;
}

const handler = async () => {
  try {
    const token = await getValidToken();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Export keduanya sekaligus — hindari mixing exports.x dan module.exports
module.exports = { handler, getValidToken };