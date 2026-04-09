// netlify/functions/order-notify.js
// Menerima webhook dari Moka saat status order berubah,
// lalu kirim WA ke customer via Fonnte dengan detail menu dan receipt.

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const STORE_NAME   = "Sector Seven";

const fmt = (n) => `Rp${new Intl.NumberFormat("id-ID").format(Number(n) || 0)}`;

// Parse items summary dari query param: "2x Latte (Hot) - Less Sugar|1x Americano"
function parseItems(itemsParam) {
  if (!itemsParam) return [];
  return decodeURIComponent(itemsParam).split("|").filter(Boolean);
}

function buildItemLines(items) {
  return items.map((item) => `  • ${item}`).join("\n");
}

function buildMessages(name, orderId, items, total) {
  const hasItems = items.length > 0;
  const itemLines = hasItems ? buildItemLines(items) : "";
  const totalLine = total ? `\n *Total:* ${fmt(total)}` : "";

  return {
    accepted: (
      `*${STORE_NAME}* Order Update \n\n` +
      'Halo *${name}*! 👋\n\n' +
      `Pesanan kamu sudah diterima dan sedang diproses barista kami.\n\n` +
      `*Detail Pesanan (${orderId}):*\n` +
      (hasItems ? `${itemLines}\n` : "") +
      `${totalLine}\n\n` +
      `Mohon ditunggu sebentar`
    ),

    completed: (
      `*${STORE_NAME}* Order Update \n\n` +
      `Halo *${name}*! ✅\n\n` +
      `Pesanan kamu sudah selesai dan siap diambil!\n\n` +
      `*Receipt (${orderId}):*\n` +
      (hasItems ? `${itemLines}\n` : "") +
      `${totalLine}\n\n` +
      `Silakan ambil di kasir. Terima kasih sudah order di *${STORE_NAME}*!`
    ),

    cancelled: (
      `*${STORE_NAME}* Order Update \n\n` +
      `Halo *${name}*. 🙏🏻\n\n` +
      `Maaf, pesanan kamu (*${orderId}*) telah dibatalkan.\n\n` +
      `Silakan hubungi kami langsung di kasir. Terima kasih.`
    ),
  };
}

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
  console.log("[order-notify] Fonnte:", JSON.stringify(data));
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
    const q = event.queryStringParameters || {};

    const eventType = q.event || "unknown";
    const orderId   = q.order || "-";
    const phone     = q.phone ? decodeURIComponent(q.phone) : "";
    const name      = q.name  ? decodeURIComponent(q.name)  : "Pelanggan";
    const total     = q.total || "";
    const items     = parseItems(q.items);

    console.log(`[order-notify] event=${eventType} order=${orderId} phone=${phone} name=${name} items=${items.length}`);

    const messages = buildMessages(name, orderId, items, total);
    const message  = messages[eventType];

    if (!message) {
      console.warn("[order-notify] Unknown event:", eventType);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "unknown_event" }) };
    }

    if (!phone) {
      console.warn("[order-notify] No phone");
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "no_phone" }) };
    }

    const result = await sendWhatsApp(phone, message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, event: eventType, order: orderId, wa: result }),
    };

  } catch (err) {
    console.error("[order-notify] Error:", err.message);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};