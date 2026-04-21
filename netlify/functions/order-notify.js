// netlify/functions/order-notify.js
// STUB — backward compat untuk order lama yang callback URL-nya masih ke sini.
// Forward semua event ke moka-callback.js dengan format yang kompatibel.
// Order baru sudah langsung pakai moka-callback.js.

import { getStore } from "@netlify/blobs";

const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const SITE_URL          = process.env.URL || "https://sectorseven.space";

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

export const handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const q         = event.queryStringParameters || {};
  const eventType = q.event || "unknown";
  const orderId   = q.order || "";

  // Map order-notify event → moka-callback status
  const statusMap = { accepted: "accepted", completed: "completed", cancelled: "rejected" };
  const status    = statusMap[eventType];

  if (!status || !orderId) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true }) };
  }

  console.log(`[order-notify] forward ${eventType} → moka-callback status=${status} order=${orderId}`);

  // Assicurarsi che grossAmount sia nel Blobs (viene da query param ?total=)
  const total = Number(q.total) || 0;
  if (total > 0) {
    try {
      const store      = getBlobsStore("pending-orders");
      const blobsData  = await store.get(orderId, { type: "json" }).catch(() => null);
      if (blobsData && !blobsData.grossAmount) {
        await store.setJSON(orderId, { ...blobsData, grossAmount: total });
      }
    } catch { /* skip */ }
  }

  // Forward ke moka-callback via internal fetch
  try {
    await fetch(`${SITE_URL}/.netlify/functions/moka-callback`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ application_order_id: orderId, status }),
    });
  } catch (err) {
    console.error("[order-notify] forward gagal:", err.message);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, forwarded: true }) };
};