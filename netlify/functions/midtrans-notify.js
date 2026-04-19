/**
 * midtrans-notify.js
 * Netlify Function — Webhook handler untuk notifikasi pembayaran dari Midtrans
 *
 * Flow:
 * 1. Terima webhook Midtrans → validasi signature
 * 2. Cek status === 'settlement'
 * 3. Baca customerPhone dari Netlify Blobs (disimpan saat checkout di moka-checkout.js)
 * 4. Kirim WA receipt ke customer
 *
 * Note: Order sudah masuk ke Moka saat checkout (moka-checkout.js).
 * midtrans-notify TIDAK perlu submit ke Moka lagi.
 */

import crypto from "crypto";
import { getStore } from "@netlify/blobs";

// ─── Config ────────────────────────────────────────────────────────────────────

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const FONNTE_TOKEN        = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID     = process.env.REFUND_GROUP_ID;
const NETLIFY_SITE_ID     = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN   = process.env.NETLIFY_API_TOKEN;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

function formatWaktuWIB(dateStr) {
  let date;
  if (!dateStr) {
    date = new Date();
  } else {
    // Midtrans transaction_time: "2024-01-15 14:32:00" — sudah WIB tapi tanpa timezone
    // Tambah +07:00 agar Node tidak parse sebagai UTC
    const normalized = dateStr.replace(" ", "T") + "+07:00";
    date = new Date(normalized);
  }
  return date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function validateSignature(orderId, statusCode, grossAmount, signatureKey) {
  const raw  = orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === signatureKey;
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
    console.log(`[sendWA] → ${target} | status: ${result?.status}`);
    return result;
  } catch (err) {
    console.error("[sendWA] Error:", err.message);
    return null;
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let notification;
  try {
    notification = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const {
    order_id,
    transaction_status,
    fraud_status,
    gross_amount,
    status_code,
    signature_key,
    transaction_time,
  } = notification;

  console.log(`[Webhook] ${order_id} — status: ${transaction_status}`);

  // ── 1. Validasi Signature ──────────────────────────────────────────────────
  if (!validateSignature(order_id, status_code, gross_amount, signature_key)) {
    console.error("[Webhook] Signature tidak valid!");
    return { statusCode: 403, body: "Invalid signature" };
  }

  // ── 2. Cek settlement ──────────────────────────────────────────────────────
  const isSettled =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!isSettled) {
    console.log(`[Webhook] Status ${transaction_status} — skip`);
    return { statusCode: 200, body: "OK" };
  }

  // ── 3. Baca data dari Blobs ────────────────────────────────────────────────
  let customerPhone = null;
  let customerName  = "Pelanggan";
  let orderItems    = [];

  try {
    const store       = getBlobsStore("pending-orders");
    const pendingData = await store.get(order_id, { type: "json" });

    if (pendingData) {
      customerPhone = pendingData.customerPhone  || null;
      customerName  = pendingData.customerName   || "Pelanggan";
      orderItems    = pendingData.items          || [];

      // Simpan grossAmount untuk dipakai moka-callback saat reject
      if (!pendingData.grossAmount) {
        await store.setJSON(order_id, { ...pendingData, grossAmount: gross_amount });
      }

      console.log(`[Blobs] Data ditemukan — phone: ${customerPhone}`);
    } else {
      console.warn(`[Blobs] Tidak ada data untuk order ${order_id}`);
    }
  } catch (err) {
    console.error(`[Blobs] Error: ${err.message}`);
  }

  // ── 4. Kirim WA Receipt ────────────────────────────────────────────────────
  if (customerPhone) {
    const itemList = orderItems.length > 0
      ? orderItems.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
      : "";

    const msg =
      `✅ *Pembayaran Berhasil!*\n\n` +
      `Order   : ${order_id}\n` +
      `Total   : ${formatRupiah(gross_amount)}\n` +
      `Waktu   : ${formatWaktuWIB(transaction_time)}\n` +
      (itemList ? `\n*Pesanan:*\n${itemList}\n` : "") +
      `\nPesananmu sedang kami konfirmasi dulu ya 🙏\n` +
      `Kami akan kabarin kamu segera setelah pesanan mulai diproses!\n\n` +
      `_Sector Seven Coffee_ ☕`;

    await sendWA(customerPhone, msg);
    console.log(`[WA] Receipt terkirim ke ${customerPhone}`);
  } else {
    console.warn(`[WA] customerPhone tidak ditemukan untuk order ${order_id}`);
    if (REFUND_GROUP_ID) {
      await sendWA(
        REFUND_GROUP_ID,
        `⚠️ *PEMBAYARAN MASUK — PHONE TIDAK DITEMUKAN*\n\n` +
        `Order ID : ${order_id}\n` +
        `Total    : ${formatRupiah(gross_amount)}\n` +
        `Waktu    : ${formatWaktuWIB(transaction_time)}\n\n` +
        `Customer tidak bisa dihubungi via WA. Cek manual.`
      );
    }
  }

  console.log(`[Handler] Order ${order_id} selesai`);
  return { statusCode: 200, body: "OK" };
};