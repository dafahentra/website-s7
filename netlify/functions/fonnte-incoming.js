/**
 * fonnte-incoming.js
 * Netlify Function — Webhook incoming message dari Fonnte
 *
 * Setup di Fonnte Dashboard:
 *   Settings → Incoming Webhook URL →
 *   https://sectorseven.space/.netlify/functions/fonnte-incoming
 *
 * Flow:
 *   1. Deteksi pesan dimulai "REFUND <order_id>"
 *   2. Validasi semua field wajib ada
 *   3. Guard double-submit: cek Blobs "refund-submissions"
 *   4. Lookup Blobs "pending-orders" → enrich: nominal, timestamp, menu
 *   5. Forward ke grup TEST (REFUND_GROUP_ID) dengan data lengkap
 *   6. Mark order di Blobs sebagai sudah disubmit
 *   7. Balas customer konfirmasi
 *
 * Format yang diharapkan dari customer:
 *   REFUND <order_id>
 *   Nama: [nama lengkap]
 *   No HP: [nomor HP]
 *   Metode: [GoPay / OVO / Dana / BCA / BRI / dll]
 *   No Rekening: [nomor rekening atau e-wallet]
 *   Atas Nama: [nama di rekening / e-wallet]
 *
 * ENV yang dibutuhkan:
 *   FONNTE_TOKEN
 *   REFUND_GROUP_ID   — ID grup WA TEST, cth: 120363xxxxxx@g.us
 *   NETLIFY_SITE_ID
 *   NETLIFY_API_TOKEN
 */

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN      = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID   = process.env.REFUND_GROUP_ID;
const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

// Field wajib yang harus diisi customer (lowercase, sesuai key setelah parse)
const REQUIRED_FIELDS = ["nama", "no hp", "metode", "no rekening", "atas nama"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

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

function formatRupiah(amount) {
  if (!amount) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTimestamp(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";
  } catch {
    return null;
  }
}

/**
 * Parse pesan multi-line ke object.
 * Baris 1 : "REFUND S7-xxx"  → orderId
 * Baris 2+ : "Key: Value"    → fields{}
 * Return null jika bukan format REFUND.
 */
function parseRefundMessage(message) {
  const lines = message.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines[0]?.toUpperCase().startsWith("REFUND ")) return null;

  const orderId = lines[0].split(/\s+/)[1]?.trim();
  if (!orderId) return null;

  const fields = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx === -1) continue;
    const key   = lines[i].slice(0, colonIdx).trim().toLowerCase();
    const value = lines[i].slice(colonIdx + 1).trim();
    if (key && value) fields[key] = value;
  }

  return { orderId, fields };
}

function getMissingFields(fields) {
  return REQUIRED_FIELDS.filter((f) => !fields[f] || fields[f].length === 0);
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    const ct = event.headers["content-type"] || "";
    body = ct.includes("application/json")
      ? JSON.parse(event.body || "{}")
      : Object.fromEntries(new URLSearchParams(event.body || ""));
  } catch {
    return { statusCode: 400, body: "Invalid body" };
  }

  // Fonnte incoming fields: sender / from, message / text
  const senderRaw = (body.sender || body.from || "").trim();
  const message   = (body.message || body.text || "").trim();
  const sender    = senderRaw.replace(/@.*/, ""); // bersihkan suffix @c.us

  console.log(`[fonnte-incoming] Dari: ${sender} | Pesan: ${message.slice(0, 80)}`);

  if (!message || !sender) {
    return { statusCode: 200, body: "OK — empty" };
  }

  // ── 1. Deteksi format REFUND ──────────────────────────────────────────────────
  if (!message.toUpperCase().startsWith("REFUND ")) {
    return { statusCode: 200, body: "OK — not refund" };
  }

  const parsed = parseRefundMessage(message);

  if (!parsed) {
    await sendWA(sender,
      `⚠️ Format tidak valid.\n\n` +
      `Pastikan baris pertama adalah:\n*REFUND <ORDER_ID>*\n\n` +
      `Contoh:\n` +
      `REFUND S7-20240521-001\n` +
      `Nama: Budi Santoso\n` +
      `No HP: 08123456789\n` +
      `Metode: GoPay\n` +
      `No Rekening: 08123456789\n` +
      `Atas Nama: Budi Santoso`
    );
    return { statusCode: 200, body: "OK — invalid format" };
  }

  const { orderId, fields } = parsed;

  // ── 2. Validasi field wajib ───────────────────────────────────────────────────
  const missing = getMissingFields(fields);
  if (missing.length > 0) {
    await sendWA(sender,
      `⚠️ Data refund tidak lengkap.\n\n` +
      `Field yang belum diisi:\n${missing.map((f) => `• ${f}`).join("\n")}\n\n` +
      `Kirim ulang dengan format lengkap ya 🙏`
    );
    return { statusCode: 200, body: "OK — missing fields" };
  }

  // ── 3. Guard: double-submit per order ID ─────────────────────────────────────
  const refundStore = getBlobsStore("refund-submissions");
  let alreadySubmitted = false;
  try {
    const existing = await refundStore.get(orderId, { type: "json" });
    if (existing) alreadySubmitted = true;
  } catch { /* key tidak ada = belum pernah submit */ }

  if (alreadySubmitted) {
    await sendWA(sender,
      `ℹ️ Refund untuk order *${orderId}* sudah kami terima sebelumnya.\n\n` +
      `Tim kami sedang memprosesnya. Mohon tunggu 1×24 jam 🙏\n\n` +
      `_Sector Seven Coffee_`
    );
    return { statusCode: 200, body: "OK — duplicate" };
  }

  // ── 4. Lookup Blobs: enrich data dari pending-orders ─────────────────────────
  let orderData = null;
  try {
    const orderStore = getBlobsStore("pending-orders");
    orderData = await orderStore.get(orderId, { type: "json" });
  } catch { /* order tidak ditemukan di Blobs */ }

  const nominal   = orderData?.grossAmount
    ? formatRupiah(orderData.grossAmount)
    : "[cek manual]";

  const timestamp = orderData?.orderTimestamp
    ? formatTimestamp(orderData.orderTimestamp)
    : "[cek manual]";

  const menuText = orderData?.items?.length > 0
    ? orderData.items.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
    : "[cek manual]";

  // ── 5. Forward ke grup TEST ───────────────────────────────────────────────────
  if (REFUND_GROUP_ID) {
    const groupMsg =
      `💸 *REFUND REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `🧾 *Data Order*\n` +
      `Order ID    : ${orderId}\n` +
      `Waktu Order : ${timestamp}\n` +
      `Menu        :\n${menuText}\n` +
      `Nominal     : ${nominal}\n\n` +
      `👤 *Data Customer*\n` +
      `Nama        : ${fields["nama"]}\n` +
      `No HP       : ${fields["no hp"]}\n` +
      `Metode      : ${fields["metode"]}\n` +
      `No Rekening : ${fields["no rekening"]}\n` +
      `Atas Nama   : ${fields["atas nama"]}\n` +
      `WA Pengirim : ${sender}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `✅ Proses transfer sesuai metode di atas.`;

    await sendWA(REFUND_GROUP_ID, groupMsg);
    console.log(`[fonnte-incoming] Refund ${orderId} diteruskan ke grup TEST`);
  } else {
    console.warn("[fonnte-incoming] REFUND_GROUP_ID tidak diset di env!");
  }

  // ── 6. Mark order sebagai sudah disubmit ─────────────────────────────────────
  try {
    await refundStore.setJSON(orderId, {
      sender,
      submittedAt: new Date().toISOString(),
      fields,
    });
  } catch (err) {
    console.error("[Blobs] Gagal simpan refund submission:", err.message);
  }

  // ── 7. Balas customer konfirmasi ──────────────────────────────────────────────
  await sendWA(sender,
    `✅ *Permintaan refund diterima!*\n\n` +
    `Order ID : *${orderId}*\n` +
    `Nominal  : ${nominal}\n\n` +
    `Data kamu sudah kami teruskan ke tim. Refund diproses dalam 1×24 jam.\n\n` +
    `_Sector Seven Coffee_ ☕`
  );

  return { statusCode: 200, body: "OK" };
};