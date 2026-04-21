/**
 * fonnte-incoming.js
 * Netlify Function — Webhook incoming message dari Fonnte
 */

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN      = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID   = process.env.REFUND_GROUP_ID;
const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

const REQUIRED_FIELDS = ["nama", "no hp", "metode", "no rekening", "atas nama"];

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

async function sendWA(target, message) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target, message, countryCode: "62" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const result = await res.json();
    console.log(`[sendWA] → ${target}: ${result?.status}`);
    return result;
  } catch (err) {
    clearTimeout(timer);
    console.error(`[sendWA] Error (${target}): ${err.message}`);
    return null;
  }
}

function formatRupiah(amount) {
  if (!amount) return "Rp -";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function parseRefundMessage(message) {
  const lines = message.trim().split("\n").map((l) => l.trim()).filter(Boolean);

  // Cari baris yang diawali REFUND — tidak harus baris pertama
  // Ini handle kasus customer copy-paste template bot yang ada header di atasnya
  const refundIdx = lines.findIndex((l) => l.toUpperCase().startsWith("REFUND "));
  if (refundIdx === -1) return null;

  const orderId = lines[refundIdx].split(/\s+/)[1]?.trim();
  if (!orderId) return null;

  const fields = {};
  for (let i = refundIdx + 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx === -1) continue;
    const key   = lines[i].slice(0, colonIdx).trim().toLowerCase();
    const value = lines[i].slice(colonIdx + 1).trim();
    if (key && value) fields[key] = value;
  }
  return { orderId, fields };
}

function getMissingFields(fields) {
  return REQUIRED_FIELDS.filter((f) => {
    const val = fields[f] || "";
    // Kosong atau masih placeholder [...]  
    return !val || val.length === 0 || (val.startsWith("[") && val.endsWith("]"));
  });
}

export const handler = async (event) => {
  // ── Selalu return 200 ke Fonnte agar tidak retry ─────────────────────────────
  const OK = { statusCode: 200, body: "OK" };

  // ── Support GET (Fonnte kadang verify webhook dengan GET) ─────────────────────
  if (event.httpMethod === "GET") return OK;
  if (event.httpMethod !== "POST") return OK;

  // ── Parse body — Fonnte bisa kirim JSON atau form-urlencoded ─────────────────
  let body = {};
  try {
    const ct = (event.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/json")) {
      body = JSON.parse(event.body || "{}");
    } else {
      body = Object.fromEntries(new URLSearchParams(event.body || ""));
    }
  } catch (err) {
    console.error("[fonnte-incoming] Parse error:", err.message);
    return OK;
  }

  // ── LOG SEMUA DATA MASUK ────────────────────────────────────────────────────
  console.log("[fonnte-incoming] RAW BODY:", JSON.stringify(body));

  // ── Ambil fields ──────────────────────────────────────────────────────────────
  const senderRaw = (body.sender || body.from || body.phone || body.number || "").toString().trim();
  const message   = (body.message || body.text || body.body || body.msg || "").toString().trim();
  const device    = (body.device || body.owner || "").toString().trim();

  console.log(`[fonnte-incoming] sender="${senderRaw}" device="${device}" message="${message.slice(0, 120)}"`);

  if (!message || !senderRaw) {
    console.log("[fonnte-incoming] Empty — skip");
    return OK;
  }

  // ── Filter pesan OUTGOING (pesan dari bot ke customer) ───────────────────────
  // Fonnte kadang trigger webhook untuk pesan outgoing juga.
  // Indikator outgoing: fromMe, type, atau sender == device
  const isOutgoing =
    body.fromMe   === true   ||
    body.fromMe   === "true" ||
    body.fromMe   === 1      ||
    body.type     === "outgoing" ||
    body.type     === "out"  ||
    body.isFromMe === true   ||
    (device && senderRaw === device);

  if (isOutgoing) {
    console.log("[fonnte-incoming] Skip — pesan outgoing dari bot");
    return OK;
  }

  const sender = senderRaw.replace(/@.*/, "").replace(/\D/g, "");

  // ── DONE command dari admin grup ─────────────────────────────────────────────
  if (message.toUpperCase().startsWith("DONE ")) {
    await handleDoneCommand(body);
    return OK;
  }

  // ── Deteksi REFUND ────────────────────────────────────────────────────────────
  if (!message.toUpperCase().includes("REFUND ")) {
    console.log("[fonnte-incoming] Bukan REFUND — skip");
    return OK;
  }

  const parsed = parseRefundMessage(message);

  if (!parsed) {
    await sendWA(sender,
      `⚠️ Format tidak valid.\n\nPastikan baris pertama:\n*REFUND <ORDER_ID>*`
    );
    return OK;
  }

  const { orderId, fields } = parsed;
  console.log(`[fonnte-incoming] REFUND detected — orderId=${orderId} fields=${JSON.stringify(fields)}`);

  // ── Validasi field wajib ──────────────────────────────────────────────────────
  const missing = getMissingFields(fields);
  if (missing.length > 0) {
    await sendWA(sender,
      `⚠️ Data refund tidak lengkap.\n\nField belum diisi:\n${missing.map((f) => `• ${f}`).join("\n")}`
    );
    return OK;
  }

  // ── Guard double-submit ───────────────────────────────────────────────────────
  const refundStore = getBlobsStore("refund-submissions");
  try {
    const existing = await refundStore.get(orderId, { type: "json" });
    if (existing) {
      await sendWA(sender,
        `ℹ️ Refund untuk order *${orderId}* sudah kami terima sebelumnya.\nMohon tunggu maksimal 2 jam 🙏`
      );
      return OK;
    }
  } catch { /* belum ada — lanjut */ }

  // ── Enrich dari Blobs ─────────────────────────────────────────────────────────
  let nominal   = "[cek manual]";
  let timestamp = "[cek manual]";
  let menuText  = "[cek manual]";

  try {
    const orderStore = getBlobsStore("pending-orders");
    const orderData  = await orderStore.get(orderId, { type: "json" });
    if (orderData) {
      nominal   = orderData.grossAmount    ? formatRupiah(orderData.grossAmount) : nominal;
      timestamp = orderData.orderTimestamp
        ? new Date(orderData.orderTimestamp).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB"
        : timestamp;
      menuText  = orderData.items?.length > 0
        ? orderData.items.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
        : menuText;
    }
  } catch (err) {
    console.warn("[fonnte-incoming] Blobs lookup gagal:", err.message);
  }

  // ── Forward ke grup TEST ──────────────────────────────────────────────────────
  if (!REFUND_GROUP_ID) {
    console.error("[fonnte-incoming] REFUND_GROUP_ID tidak diset!");
  } else {
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
    console.log(`[fonnte-incoming] Forwarded ke grup: ${REFUND_GROUP_ID}`);
  }

  // ── Simpan ke Blobs ───────────────────────────────────────────────────────────
  try {
    await refundStore.setJSON(orderId, {
      sender, submittedAt: new Date().toISOString(), fields,
    });
  } catch (err) {
    console.error("[fonnte-incoming] Gagal simpan refund submission:", err.message);
  }

  // ── Balas customer ────────────────────────────────────────────────────────────
  await sendWA(sender,
    `✅ *Permintaan refund diterima!*\n\n` +
    `Order ID : *${orderId}*\n` +
    `Nominal  : ${nominal}\n\n` +
    `Data kamu sudah kami teruskan ke tim. Refund diproses dalam *2 jam*.\n\n` +
    `_Sector Seven Coffee_ ☕`
  );

  return OK;
};

// ─── Handler DONE command dari admin di grup TEST ───────────────────────────────
// Admin ketik: DONE S7-xxx
// Bot kirim WA ke customer bahwa refund sudah diproses.
export async function handleDoneCommand(body) {
  const message   = (body.message || body.text || "").trim();
  const senderRaw = (body.sender  || body.from || "").toString().trim();

  // Hanya proses pesan dari REFUND_GROUP_ID
  if (!REFUND_GROUP_ID || senderRaw !== REFUND_GROUP_ID) return;
  if (!message.toUpperCase().startsWith("DONE ")) return;

  const orderId = message.split(/\s+/)[1]?.trim();
  if (!orderId) return;

  console.log(`[fonnte-incoming] DONE command — orderId=${orderId}`);

  // Ambil data customer dari refund-submissions
  let customerPhone = null;
  let nominal       = "[cek manual]";
  let metode        = "[cek manual]";

  try {
    const refundStore = getBlobsStore("refund-submissions");
    const refundData  = await refundStore.get(orderId, { type: "json" });
    if (refundData) {
      customerPhone = refundData.sender || null;
      metode        = refundData.fields?.["metode"]    || metode;
      nominal       = refundData.fields?.["nominal"]   || nominal;
    }
  } catch (err) {
    console.warn("[fonnte-incoming] DONE — Blobs lookup gagal:", err.message);
  }

  // Fallback: coba ambil dari pending-orders
  if (!nominal || nominal === "[cek manual]") {
    try {
      const orderStore = getBlobsStore("pending-orders");
      const orderData  = await orderStore.get(orderId, { type: "json" });
      if (orderData?.grossAmount) {
        nominal = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(orderData.grossAmount);
      }
    } catch { /* skip */ }
  }

  if (!customerPhone) {
    console.warn(`[fonnte-incoming] DONE — customer phone tidak ditemukan untuk ${orderId}`);
    await sendWA(REFUND_GROUP_ID,
      `⚠️ Gagal kirim notif ke customer.\nPhone tidak ditemukan untuk order ${orderId}.\nKirim manual.`
    );
    return;
  }

  await sendWA(customerPhone,
    `✅ *Refund berhasil diproses!*\n\n` +
    `Order ID : *${orderId}*\n` +
    `Nominal  : ${nominal}\n` +
    `Metode   : ${metode}\n\n` +
    `Dana sudah kami kirimkan. Mohon cek dalam beberapa menit ya 🙏\n\n` +
    `_Sector Seven Coffee_ ☕`
  );

  console.log(`[fonnte-incoming] Notif DONE terkirim ke ${customerPhone}`);
}