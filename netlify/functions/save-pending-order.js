// netlify/functions/save-pending-order.js
// Simpan order payload ke Netlify Blobs sebelum Midtrans dibuka.
// Data ini digunakan oleh midtrans-notify sebagai safety net
// kalau onSuccess callback tidak terpanggil.
//
// Order data otomatis expire setelah 24 jam (TTL Blobs).

import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      orderId,
      orderPayload,   // data Moka (wajib)
      customerPhone,  // nomor WA customer, contoh: "6281234567890" (wajib untuk WA receipt)
      customerName,   // nama customer (opsional, fallback ke "Pelanggan")
      items,          // array ringkasan item untuk WA receipt, contoh: [{name, qty}]
    } = JSON.parse(event.body || "{}");

    if (!orderId || !orderPayload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing orderId or orderPayload" }),
      };
    }

    const store = getStore("pending-orders");

    // Simpan sebagai objek JSON langsung (bukan double-stringify)
    // agar midtrans-notify bisa baca dengan { type: "json" }
    await store.setJSON(
      orderId,
      {
        orderId,
        orderData: orderPayload,   // rename jadi orderData agar konsisten dengan midtrans-notify
        customerPhone: customerPhone || null,
        customerName: customerName || "Pelanggan",
        items: items || [],
        savedAt: new Date().toISOString(),
      },
      { ttl: 86400 } // 24 jam
    );

    console.log(`[save-pending-order] Saved ${orderId}`);

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