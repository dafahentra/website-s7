// netlify/functions/save-pending-order.js
// Simpan order payload ke Blobs SEBELUM payment.
// NEW ARCH: Dipanggil langsung dari frontend (bukan fire-and-forget dari moka-checkout).
// Data dibaca oleh midtrans-notify setelah settlement → submit ke Moka.

import { getStore } from "@netlify/blobs";

const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      orderId, customerPhone, customerName,
      grossAmount, clientFinalPrice, orderTimestamp, items,
    } = body;

    const orderData = body.orderPayload || body.orderData || null;

    if (!orderId || !orderData) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: "Missing orderId or orderPayload" }),
      };
    }

    const store = getBlobsStore("pending-orders");
    await store.setJSON(orderId, {
      orderId,
      orderData,
      customerPhone:    customerPhone  || null,
      customerName:     customerName   || "Pelanggan",
      grossAmount:      grossAmount    || null,
      clientFinalPrice: typeof clientFinalPrice === "number" ? clientFinalPrice : null,
      orderTimestamp:   orderTimestamp  || new Date().toISOString(),
      items:            items          || [],
      savedAt:          new Date().toISOString(),
    }, { ttl: 86400 });

    console.log(`[save-pending-order] Saved ${orderId} | clientFinalPrice=${clientFinalPrice ?? "null"}`);

    return {
      statusCode: 200, headers: cors,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[save-pending-order] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};