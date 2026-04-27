// netlify/functions/save-pending-order.js
// Simpan order payload ke Netlify Blobs sebelum Midtrans dibuka.
// Dipanggil oleh moka-checkout.js setelah order berhasil masuk Moka.
// Data dibaca oleh:
//   - midtrans-notify.js → setelah settlement, tulis grossAmount
//   - moka-callback.js   → saat kasir accept/reject/complete
//
// Perubahan:
//   [FIX] Simpan clientFinalPrice dari frontend.
//   moka-callback.js pakai ini sebagai fallback jika grossAmount
//   belum ditulis oleh midtrans-notify (race condition).

import { getStore } from "@netlify/blobs";

const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Hanya boleh dipanggil dari internal
  const origin  = event.headers["origin"] || "";
  const referer = event.headers["referer"] || "";
  const allowed = ["https://sectorseven.space", "http://localhost"];
  const isAllowed = allowed.some((d) => origin.startsWith(d) || referer.startsWith(d));
  if (!isAllowed && origin !== "") {
    console.warn("[save-pending-order] Blocked request from:", origin);
    return { statusCode: 403, body: "Forbidden" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      orderId,
      customerPhone,
      customerName,
      grossAmount,
      clientFinalPrice,
      orderTimestamp,
      items,
    } = body;

    // Support dua nama field: orderPayload (dari frontend baru) atau orderData (legacy)
    const orderData = body.orderPayload || body.orderData || null;

    if (!orderId || !orderData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing orderId or orderPayload" }),
      };
    }

    const store = getBlobsStore("pending-orders");

    await store.setJSON(
      orderId,
      {
        orderId,
        orderData,
        customerPhone:   customerPhone    || null,
        customerName:    customerName     || "Pelanggan",
        grossAmount:     grossAmount      || null,
        clientFinalPrice: typeof clientFinalPrice === "number" ? clientFinalPrice : null,
        orderTimestamp:  orderTimestamp    || new Date().toISOString(),
        items:           items            || [],
        savedAt:         new Date().toISOString(),
      },
      { ttl: 86400 } // 24 jam
    );

    console.log(
      `[save-pending-order] Saved ${orderId}` +
      (clientFinalPrice != null ? ` | clientFinalPrice=${clientFinalPrice}` : "")
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[save-pending-order] Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};