// netlify/functions/get-pending-order.js
// Ambil pending order data dari Netlify Blobs.
// Dipanggil oleh midtrans-notify sebagai safety net.

import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  const orderId = event.queryStringParameters?.id;

  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
  }

  try {
    const store = getStore("pending-orders");
    const raw   = await store.get(orderId).catch(() => null);

    if (!raw) {
      return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: raw,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};