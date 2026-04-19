/**
 * midtrans-notify.js
 * Netlify Function — Webhook handler untuk notifikasi pembayaran dari Midtrans
 *
 * Flow:
 * 1. Terima webhook Midtrans → validasi signature
 * 2. Cek status === 'settlement'
 * 3. Kirim WA receipt ke customer (langsung, sebelum proses ke Moka)
 * 4. Submit order ke Moka dengan auto retry 3x (5s → 10s → 30s)
 * 5. Jika semua retry gagal → simpan ke Netlify Blobs + kirim WA alert ke grup admin
 */

import crypto from "crypto";
import { getStore } from "@netlify/blobs";

// ─── Config ────────────────────────────────────────────────────────────────────

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MOKA_OUTLET_ID = process.env.MOKA_OUTLET_ID;
const MOKA_EMAIL = process.env.MOKA_EMAIL;
const MOKA_PASSWORD = process.env.MOKA_PASSWORD;
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

// Netlify Blobs config
const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;

// Helper: get Blobs store dengan manual config sebagai fallback
function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

// ID grup WA admin — sama dengan REFUND_GROUP_ID di moka-callback & fonnte-incoming
const REFUND_GROUP_ID = process.env.REFUND_GROUP_ID;

// Token sederhana untuk endpoint retry (bisa diisi sembarang string panjang)
const RETRY_SECRET = process.env.RETRY_SECRET || "s7-retry-secret-2024";

// Base URL website untuk generate link retry
const BASE_URL = process.env.URL || "https://sectorseven.space";

// Callback URLs Moka — dipasang di setiap order agar Moka bisa notify kita
const MOKA_CALLBACK_URL = `${BASE_URL}/.netlify/functions/moka-callback`;

// ─── Utility: Delay ────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Utility: Format waktu WIB ─────────────────────────────────────────────────

function formatWaktuWIB(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";
}

// ─── Utility: Format Rupiah ────────────────────────────────────────────────────

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Validasi Signature Midtrans ───────────────────────────────────────────────

function validateSignature(orderId, statusCode, grossAmount, signatureKey) {
  const rawString = orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash("sha512").update(rawString).digest("hex");
  return hash === signatureKey;
}

// ─── Kirim WA via Fonnte ───────────────────────────────────────────────────────

async function sendWA(target, message) {
  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        message,
        countryCode: "62",
      }),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("[sendWA] Error:", err.message);
    return null;
  }
}

// ─── Ambil Moka Token ──────────────────────────────────────────────────────────

async function getMokaToken() {
  const response = await fetch("https://api.mokapos.com/api/v1/auth/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: MOKA_EMAIL, password: MOKA_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Moka auth failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.access_token;
}

// ─── Submit Order ke Moka ──────────────────────────────────────────────────────

async function submitOrderToMoka(orderData) {
  const token = await getMokaToken();

  // Inject callback URLs agar Moka bisa notify kita saat kasir accept/reject/complete
  const payload = {
    ...orderData,
    accept_order_notification_url:   MOKA_CALLBACK_URL,
    cancel_order_notification_url:   MOKA_CALLBACK_URL,
    complete_order_notification_url:  MOKA_CALLBACK_URL,
  };

  const response = await fetch(
    `https://api.mokapos.com/api/v2/outlets/${MOKA_OUTLET_ID}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Moka order failed (${response.status}): ${JSON.stringify(result)}`
    );
  }

  return result;
}

// ─── Submit ke Moka dengan Auto Retry ─────────────────────────────────────────

async function submitWithRetry(orderData, maxRetries = 3) {
  const delays = [5000, 10000, 30000]; // 5s, 10s, 30s
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Moka] Attempt ${attempt}/${maxRetries}...`);
      const result = await submitOrderToMoka(orderData);
      console.log(`[Moka] Sukses pada attempt ${attempt}`);
      return { success: true, result };
    } catch (err) {
      lastError = err;
      console.error(`[Moka] Attempt ${attempt} gagal: ${err.message}`);

      if (attempt < maxRetries) {
        console.log(`[Moka] Retry dalam ${delays[attempt - 1] / 1000}s...`);
        await delay(delays[attempt - 1]);
      }
    }
  }

  return { success: false, error: lastError?.message || "Unknown error" };
}

// ─── Generate Token Retry ──────────────────────────────────────────────────────

function generateRetryToken(orderId) {
  return crypto
    .createHmac("sha256", RETRY_SECRET)
    .update(orderId)
    .digest("hex")
    .slice(0, 16);
}

// ─── Simpan Pending Order ke Netlify Blobs ─────────────────────────────────────

async function savePendingOrder(orderId, orderData, errorMsg) {
  try {
    const store = getBlobsStore("pending-orders");
    await store.setJSON(orderId, {
      orderId,
      orderData,
      errorMsg,
      failedAt: new Date().toISOString(),
      retryCount: 0,
    });
    console.log(`[Blobs] Order ${orderId} disimpan sebagai pending`);
  } catch (err) {
    console.error(`[Blobs] Gagal simpan pending order: ${err.message}`);
  }
}

// ─── Main Handler ──────────────────────────────────────────────────────────────

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
    payment_type,
  } = notification;

  console.log(`[Webhook] ${order_id} — status: ${transaction_status}`);

  // ── 1. Validasi Signature ────────────────────────────────────────────────────
  if (
    !validateSignature(order_id, status_code, gross_amount, signature_key)
  ) {
    console.error("[Webhook] Signature tidak valid!");
    return { statusCode: 403, body: "Invalid signature" };
  }

  // ── 2. Cek apakah settlement ─────────────────────────────────────────────────
  const isSettled =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!isSettled) {
    console.log(`[Webhook] Status ${transaction_status} — skip`);
    return { statusCode: 200, body: "OK" };
  }

  // ── 3. Ambil data order dari Netlify Blobs ───────────────────────────────────
  let pendingData = null;
  let customerPhone = null;
  let customerName = null;
  let mokaOrderData = null;
  let orderItems = [];

  try {
    const store = getBlobsStore("pending-orders");
    pendingData = await store.get(order_id, { type: "json" });

    if (pendingData) {
      customerPhone = pendingData.customerPhone;
      customerName = pendingData.customerName || "Pelanggan";
      mokaOrderData = pendingData.orderData;
      orderItems = pendingData.items || [];
    }
  } catch (err) {
    console.error(`[Blobs] Gagal ambil pending order: ${err.message}`);
  }

  // ── 4. Kirim WA Receipt ke Customer (langsung setelah settlement) ─────────────
  if (customerPhone) {
    const itemList =
      orderItems.length > 0
        ? orderItems
            .map((item) => `  • ${item.name} x${item.qty}`)
            .join("\n")
        : "";

    const receiptMessage =
      `✅ *Pembayaran Berhasil!*\n\n` +
      `Order   : ${order_id}\n` +
      `Total   : ${formatRupiah(gross_amount)}\n` +
      `Waktu   : ${formatWaktuWIB(transaction_time)}\n` +
      (itemList ? `\n*Pesanan:*\n${itemList}\n` : "") +
      `\nPesananmu sedang kami konfirmasi dulu ya 🙏\n` +
      `Kami akan kabarin kamu segera setelah pesanan mulai diproses!\n\n` +
      `_Sector Seven Coffee_ ☕`;

    await sendWA(customerPhone, receiptMessage);
    console.log(`[WA] Receipt terkirim ke ${customerPhone}`);
  } else {
    console.warn(`[WA] customerPhone tidak ditemukan untuk order ${order_id}`);
  }

  // ── 5. Submit ke Moka dengan Auto Retry ───────────────────────────────────────
  if (!mokaOrderData) {
    console.error(`[Moka] Data order tidak ditemukan di Blobs untuk ${order_id}`);

    if (REFUND_GROUP_ID) {
      await sendWA(
        REFUND_GROUP_ID,
        `🚨 *ORDER DATA TIDAK DITEMUKAN*\n\n` +
          `Order ID : ${order_id}\n` +
          `Total    : ${formatRupiah(gross_amount)}\n` +
          `Waktu    : ${formatWaktuWIB(transaction_time)}\n\n` +
          `⚠️ Pembayaran sudah masuk, data order hilang dari sistem.\n` +
          `Proses manual segera!`
      );
    }

    return { statusCode: 200, body: "OK — no order data" };
  }

  // Pastikan grossAmount tersimpan di Blobs untuk kebutuhan moka-callback (pesan refund)
  try {
    const store = getBlobsStore("pending-orders");
    const existing = await store.get(order_id, { type: "json" });
    if (existing && !existing.grossAmount) {
      await store.setJSON(order_id, { ...existing, grossAmount: gross_amount });
    }
  } catch (_) {}

  const mokaResult = await submitWithRetry(mokaOrderData);

  // ── 6. Jika Semua Retry Gagal ─────────────────────────────────────────────────
  if (!mokaResult.success) {
    console.error(`[Moka] Semua retry gagal untuk ${order_id}`);

    await savePendingOrder(order_id, mokaOrderData, mokaResult.error);

    const retryToken = generateRetryToken(order_id);
    const retryLink = `${BASE_URL}/.netlify/functions/retry-order?id=${order_id}&token=${retryToken}`;

    if (REFUND_GROUP_ID) {
      await sendWA(
        REFUND_GROUP_ID,
        `🚨 *ORDER GAGAL MASUK MOKA*\n\n` +
        `Order ID : ${order_id}\n` +
        `Total    : ${formatRupiah(gross_amount)}\n` +
        `Customer : ${customerPhone || "tidak diketahui"}\n` +
        `Waktu    : ${formatWaktuWIB(transaction_time)}\n` +
        `Error    : ${mokaResult.error}\n\n` +
        `⚠️ Pembayaran sudah masuk, proses manual atau coba kirim ulang:\n` +
        `🔄 ${retryLink}`
      );
      console.log(`[WA] Alert grup terkirim`);
    }

    return { statusCode: 200, body: "OK — Moka failed, alert sent" };
  }

  // ── 7. Sukses — hapus dari pending Blobs ──────────────────────────────────────
  try {
    const store = getBlobsStore("pending-orders");
    await store.delete(order_id);
    console.log(`[Blobs] Pending order ${order_id} dihapus`);
  } catch (err) {
    console.warn(`[Blobs] Gagal hapus pending: ${err.message}`);
  }

  console.log(`[Handler] Order ${order_id} selesai diproses`);
  return { statusCode: 200, body: "OK" };
};