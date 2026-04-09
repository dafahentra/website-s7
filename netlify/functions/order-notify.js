// netlify/functions/order-notify.js
// Menerima webhook dari Moka saat status order berubah,
// lalu kirim WA ke customer via Fonnte.
//
// Customer info (name, phone) disimpan di Netlify Blobs saat order dibuat
// di moka-checkout.js, lalu diambil di sini pakai order ID.

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const STORE_NAME   = "Sector Seven";

const MESSAGES = {
  accepted: (name, orderId) =>
    `Halo *${name}*! 👋\n\n` +
    `Pesanan kamu (*${orderId}*) sudah diterima dan sedang diproses barista kami. ☕\n\n` +
    `Mohon tunggu sebentar ya~`,

  completed: (name, orderId) =>
    `Halo *${name}*! ✅\n\n` +
    `Pesanan kamu (*${orderId}*) sudah selesai dan siap diambil!\n\n` +
    `Silakan ambil di kasir. Terima kasih sudah order di *${STORE_NAME}* 🖤`,

  cancelled: (name, orderId) =>
    `Halo *${name}*. ℹ️\n\n` +
    `Maaf, pesanan kamu (*${orderId}*) dibatalkan.\n\n` +
    `Silakan hubungi kami langsung di kasir. Terima kasih.`,
};

async function sendWhatsApp(phone, message) {
  if (!FONNTE_TOKEN) {
    console.warn("[order-notify] FONNTE_TOKEN not set — skipping");
    return { skipped: true };
  }

  const normalized = phone
    .replace(/[\s\-]/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "62");

  console.log(`[order-notify] Sending WA to ${normalized}`);

  const res  = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { "Authorization": FONNTE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ target: normalized, message, countryCode: "62" }),
  });

  const data = await res.json().catch(() => ({}));
  console.log("[order-notify] Fonnte response:", JSON.stringify(data));
  return data;
}

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const q         = event.queryStringParameters || {};
    const eventType = q.event || "unknown";
    const orderId   = q.order || "";

    console.log(`[order-notify] event=${eventType} order=${orderId}`);

    if (!orderId) {
      console.warn("[order-notify] No order ID in request");
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "no_order_id" }) };
    }

    const msgFn = MESSAGES[eventType];
    if (!msgFn) {
      console.warn("[order-notify] Unknown event:", eventType);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "unknown_event" }) };
    }

    // Ambil customer info dari Netlify Blobs
    let customerName  = "Pelanggan";
    let customerPhone = "";

    try {
      const store = getStore("order-customers");
      const raw   = await store.get(orderId);
      if (raw) {
        const info  = JSON.parse(raw);
        customerName  = info.name  || "Pelanggan";
        customerPhone = info.phone || "";
        console.log(`[order-notify] Found customer: ${customerName} (${customerPhone})`);
      } else {
        console.warn(`[order-notify] No customer info found for order ${orderId}`);
      }
    } catch (blobErr) {
      console.error("[order-notify] Blob read error:", blobErr.message);
    }

    if (!customerPhone) {
      console.warn("[order-notify] No phone number — skipping WA");
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "no_phone" }) };
    }

    const result = await sendWhatsApp(customerPhone, msgFn(customerName, orderId));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, event: eventType, order: orderId, wa: result }),
    };

  } catch (err) {
    console.error("[order-notify] Error:", err.message);
    // Selalu 200 agar Moka tidak retry
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};