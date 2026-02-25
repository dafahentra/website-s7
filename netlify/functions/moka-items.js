// netlify/functions/moka-items.js
// Fetches all items from Moka including item_variants + active_modifiers.
// Uses refresh_token flow via moka-token.js helper.

const MOKA_BASE = "https://api.mokapos.com";
const { getValidToken } = require("./moka-token");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const token    = await getValidToken();
    const outletId = process.env.MOKA_OUTLET_ID;

    if (!outletId) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "MOKA_OUTLET_ID not set. Add it to Netlify environment variables.",
        }),
      };
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
        body: JSON.stringify({
          error: data?.meta?.error_message || `Moka API error ${res.status}`,
        }),
      };
    }

    const items = data?.data?.items ?? data?.data?.item ?? [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, max-age=300", // cache 5 min at CDN
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