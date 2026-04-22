/**
 * fonnte-incoming.js
 * Netlify Function — Webhook incoming message dari Fonnte
 *
 * Satu-satunya command yang dihandle: DONE <order_id>
 * Diketik admin di grup TEST setelah refund manual via Midtrans dashboard.
 * Bot otomatis WA ke customer bahwa refund sudah diproses.
 *
 * Setup Fonnte:
 *   Device → Edit → Webhook: https://sectorseven.space/.netlify/functions/fonnte-incoming
 *   autoread: On
 *   Group: On
 */

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN      = process.env.FONNTE_TOKEN;
const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

async function sendWA(target, message) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target, message, countryCode: "62" }),
      signal:  controller.signal,
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
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

export const handler = async (event) => {
  const OK = { statusCode: 200, body: "OK" };

  if (event.httpMethod === "GET") return OK;
  if (event.httpMethod !== "POST") return OK;

  let body = {};
  try {
    const ct = (event.headers["content-type"] || "").toLowerCase();
    body = ct.includes("application/json")
      ? JSON.parse(event.body || "{}")
      : Object.fromEntries(new URLSearchParams(event.body || ""));
  } catch {
    return OK;
  }

  const message = (body.message || body.text || "").trim();
  const isOutgoing =
    body.fromMe === true || body.fromMe === "true" || body.fromMe === 1 ||
    body.type === "outgoing" || body.isFromMe === true;

  if (!message || isOutgoing) return OK;

  console.log(`[fonnte-incoming] msg="${message.slice(0, 80)}"`);

  // ── DONE command ──────────────────────────────────────────────────────────────
  if (!message.toUpperCase().startsWith("DONE ")) return OK;

  const orderId = message.split(/\s+/)[1]?.trim();
  if (!orderId) return OK;

  console.log(`[fonnte-incoming] DONE command — orderId=${orderId}`);

  // Ambil data customer dari Blobs
  let customerPhone = null;
  let nominal       = "[cek manual]";

  try {
    const store     = getBlobsStore("pending-orders");
    const orderData = await store.get(orderId, { type: "json" });
    if (orderData) {
      customerPhone = orderData.customerPhone || null;
      nominal       = orderData.grossAmount ? formatRupiah(orderData.grossAmount) : nominal;
    }
  } catch (err) {
    console.warn("[fonnte-incoming] Blobs lookup gagal:", err.message);
  }

  if (!customerPhone) {
    console.warn(`[fonnte-incoming] Customer phone tidak ditemukan untuk ${orderId}`);
    return OK;
  }

  await sendWA(customerPhone,
    `✅ *Refund berhasil diproses!*\n\n` +
    `Order ID : *${orderId}*\n` +
    `Nominal  : ${nominal}\n\n` +
    `Dana sudah kami kembalikan ke metode pembayaran kamu.\n` +
    `Mohon cek dalam beberapa menit ya 🙏`
  );

  console.log(`[fonnte-incoming] Notif DONE terkirim ke ${customerPhone}`);
  return OK;
};