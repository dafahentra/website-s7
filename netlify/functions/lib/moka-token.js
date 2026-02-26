// netlify/lib/moka-token.js
// Helper untuk mendapatkan access token via refresh_token flow.
// Diletakkan di netlify/lib/ (bukan netlify/functions/) agar tidak
// di-expose sebagai endpoint dan tidak menyebabkan routing bug netlify dev.
// REQUIRES env vars: MOKA_CLIENT_ID, MOKA_SECRET, MOKA_REFRESH_TOKEN

const MOKA_BASE = "https://api.mokapos.com";

// In-memory cache — hidup selama function instance warm
let _cache = null;

async function getValidToken() {
  // Pakai cached token jika masih valid (dengan buffer 60s)
  if (_cache && Date.now() < _cache.expires_at) {
    return _cache.access_token;
  }

  // Gunakan refresh token dari cache jika ada (rotation), fallback ke env var
  const refreshToken = _cache?.refresh_token || process.env.MOKA_REFRESH_TOKEN;
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

  // Simpan refresh_token baru — Moka melakukan token rotation,
  // setiap refresh token hanya bisa dipakai SEKALI
  _cache = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at:    Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  return _cache.access_token;
}

module.exports = { getValidToken };