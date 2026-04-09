// netlify/functions/order-notify.js
// Menerima webhook dari Moka saat status order berubah,
// lalu kirim notifikasi WhatsApp ke customer via Fonnte.
//
// Setup:
//   1. Daftar di https://fonnte.com
//   2. Add Device → scan QR dengan WA yang akan jadi pengirim
//   3. Copy token → set env var FONNTE_TOKEN di Netlify Dashboard
//
// Webhook ini otomatis didaftarkan ke Moka saat order dibuat
// di useMokaCheckout.js (accept/complete/cancel_order_notification_url)

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const STORE_NAME   = "Sector Seven";

// ── Pesan WA per status ───────────────────────────────────────────────────────
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

// ── Kirim WA via Fonnte ───────────────────────────────────────────────────────
async function sendWhatsApp(phone, message) {
  if (!FONNTE_TOKEN) {
    console.warn("[order-notify] FONNTE_TOKEN not set — skipping WA send");
    return { skipped: true };
  }

  // Normalize: 08xx → 628xx, +628xx → 628xx
  const normalized = phone
    .replace(/\s|-/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "62");

  console.log(`[order-notify] Sending WA to ${normalized}`);

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": FONNTE_TOKEN,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      target:      normalized,
      message,
      countryCode: "62",
    }),
  });

  const data = await res.json().catch(() => ({}));
  console.log("[order-notify] Fonnte response:", JSON.stringify(data));
  return data;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    // Baca params — Moka bisa kirim via GET query string atau POST body
    const q = event.queryStringParameters || {};

    let bodyParams = {};
    if (event.body) {
      try { bodyParams = JSON.parse(event.body); } catch { /* ignore */ }
    }

    const eventType = q.event  || bodyParams.event  || "unknown";
    const orderId   = q.order  || bodyParams.order  || "-";
    const phone     = q.phone  || bodyParams.phone  || "";
    const name      = decodeURIComponent(q.name || bodyParams.name || "Pelanggan");

    console.log(`[order-notify] event=${eventType} order=${orderId} phone=${phone} name=${name}`);

    const msgFn = MESSAGES[eventType];

    if (!msgFn) {
      console.warn("[order-notify] Unknown event type:", eventType);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, skipped: true, reason: "unknown_event" }),
      };
    }

    if (!phone) {
      console.warn("[order-notify] No phone number in request");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, skipped: true, reason: "no_phone" }),
      };
    }

    const result = await sendWhatsApp(phone, msgFn(name, orderId));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, event: eventType, order: orderId, wa: result }),
    };

  } catch (err) {
    console.error("[order-notify] Unhandled error:", err.message);
    // Selalu return 200 agar Moka tidak retry terus-menerus
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};