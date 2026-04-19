/**
 * fonnte-incoming.js
 * Netlify Function — Menerima incoming message dari Fonnte (webhook)
 *
 * Setup di Fonnte Dashboard:
 *   Settings → Incoming Webhook URL →
 *   https://sectorseven.space/.netlify/functions/fonnte-incoming
 *
 * Flow:
 *   Customer balas WA dengan format:
 *     REFUND S7-xxx
 *     Nama: Budi
 *     Metode: GoPay
 *     Nomor: 081234567890
 *     Atas Nama: Budi Santoso
 *
 *   → Sistem deteksi pesan dimulai dengan "REFUND"
 *   → Forward ke grup admin dengan format rapi
 *   → Balas customer dengan konfirmasi
 */

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID = process.env.REFUND_GROUP_ID; // 120363407944490567@g.us

// ─── Utility: Kirim WA via Fonnte ──────────────────────────────────────────────

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });
    const result = await res.json();
    console.log(`[sendWA] → ${target}: ${result?.status}`);
    return result;
  } catch (err) {
    console.error(`[sendWA] Error: ${err.message}`);
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    // Fonnte mengirim data sebagai form-urlencoded atau JSON
    // tergantung konfigurasi webhook
    const contentType = event.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      body = JSON.parse(event.body || "{}");
    } else {
      // Parse form-urlencoded
      const params = new URLSearchParams(event.body || "");
      body = Object.fromEntries(params.entries());
    }
  } catch {
    return { statusCode: 400, body: "Invalid body" };
  }

  // Fonnte incoming webhook fields:
  // sender   — nomor pengirim (tanpa @c.us)
  // message  — isi pesan
  // device   — nomor WA device kamu
  const senderRaw = body.sender || body.from || "";
  const message   = (body.message || body.text || "").trim();

  console.log(`[fonnte-incoming] Dari: ${senderRaw} | Pesan: ${message.slice(0, 80)}`);

  if (!message || !senderRaw) {
    return { statusCode: 200, body: "OK — empty message" };
  }

  // ── Deteksi format REFUND ─────────────────────────────────────────────────────
  const isRefund = message.toUpperCase().startsWith("REFUND");

  if (!isRefund) {
    // Bukan format refund — abaikan
    console.log("[fonnte-incoming] Bukan format REFUND, skip");
    return { statusCode: 200, body: "OK — not a refund" };
  }

  // ── Forward ke grup admin ─────────────────────────────────────────────────────
  if (REFUND_GROUP_ID) {
    const forwardMsg =
      `💸 *REFUND REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Dari: ${senderRaw}\n\n` +
      `${message}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Proses manual via GoPay/OVO/Dana/Transfer.`;

    await sendWA(REFUND_GROUP_ID, forwardMsg);
    console.log(`[fonnte-incoming] Refund request diteruskan ke grup`);
  } else {
    console.warn("[fonnte-incoming] REFUND_GROUP_ID tidak diset di env!");
  }

  // ── Balas customer dengan konfirmasi ──────────────────────────────────────────
  const senderNumber = senderRaw.replace(/@.*/, ""); // bersihkan @c.us jika ada
  const replyMsg =
    `✅ *Permintaan refund diterima!*\n\n` +
    `Tim kami sudah menerima data refund kamu dan akan memprosesnya dalam 1x24 jam.\n\n` +
    `Jika ada pertanyaan, kamu bisa hubungi kami langsung di kedai ya 🙏\n\n` +
    `_Sector Seven Coffee_`;

  await sendWA(senderNumber, replyMsg);

  return { statusCode: 200, body: "OK" };
};