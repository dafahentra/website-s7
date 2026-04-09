// netlify/functions/instagram-feed.js
// Fetch Instagram posts via Graph API dan cache 1 jam di memory.
// Auto-refresh token sebelum expired (60 hari).
//
// Env vars yang dibutuhkan (set di Netlify Dashboard):
//   INSTAGRAM_ACCESS_TOKEN  — long-lived token dari Meta Developer
//   INSTAGRAM_USER_ID       — numeric user ID (17841479727229120)

const IG_BASE  = "https://graph.instagram.com";
const FIELDS   = "id,media_type,media_url,thumbnail_url,permalink,timestamp";
const LIMIT    = 12;

// In-memory cache
let _cache = null;

async function fetchPosts(token, userId) {
  const url = `${IG_BASE}/${userId}/media?fields=${FIELDS}&limit=${LIMIT}&access_token=${token}`;
  const res  = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data?.error?.message || `Instagram API error ${res.status}`);
  }

  return (data.data || []).map((p) => ({
    id:        p.id,
    type:      p.media_type,          // IMAGE, VIDEO, CAROUSEL_ALBUM
    url:       p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
    permalink: p.permalink,
    timestamp: p.timestamp,
  }));
}

async function refreshTokenIfNeeded(token) {
  // Refresh token setiap 50 hari (expired setelah 60 hari)
  try {
    const res  = await fetch(`${IG_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`);
    const data = await res.json();
    if (data.access_token) {
      console.log("[instagram-feed] Token refreshed successfully");

      // Update Netlify env var otomatis kalau ada NETLIFY_API_TOKEN
      const apiToken = process.env.NETLIFY_API_TOKEN;
      const siteId   = process.env.NETLIFY_SITE_ID;
      if (apiToken && siteId) {
        await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/INSTAGRAM_ACCESS_TOKEN`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ key: "INSTAGRAM_ACCESS_TOKEN", values: [{ context: "all", value: data.access_token }] }),
        }).catch((e) => console.error("[instagram-feed] Failed to update token:", e.message));
      }

      return data.access_token;
    }
  } catch (e) {
    console.error("[instagram-feed] Token refresh failed:", e.message);
  }
  return token;
}

export const handler = async () => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600", // browser cache 1 jam
  };

  try {
    // Gunakan cache kalau masih fresh (< 1 jam)
    if (_cache && Date.now() - _cache.at < 3600_000) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(_cache.posts) };
    }

    const token  = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;

    if (!token || !userId) {
      throw new Error("INSTAGRAM_ACCESS_TOKEN atau INSTAGRAM_USER_ID tidak di-set");
    }

    const posts = await fetchPosts(token, userId);

    _cache = { posts, at: Date.now() };
    console.log(`[instagram-feed] Fetched ${posts.length} posts`);

    // Refresh token di background (fire and forget)
    refreshTokenIfNeeded(token);

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(posts) };

  } catch (err) {
    console.error("[instagram-feed] Error:", err.message);

    // Kalau cache ada meski expired, return cache daripada error
    if (_cache) {
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(_cache.posts) };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};