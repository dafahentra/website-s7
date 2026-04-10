// netlify/functions/midtrans-notify.js
// Safety net — Midtrans hit URL ini dari server mereka setiap transaksi selesai.
// Tidak bergantung pada browser customer, jadi tidak bisa miss.
//
// Setup di Midtrans Dashboard → Settings → Configuration:
//   Payment Notification URL: https://sectorseven.space/.netlify/functions/midtrans-notify
//
// Flow:
//   1. Customer bayar → Midtrans proses
//   2. Midtrans hit URL ini dengan status transaksi
//   3. Kalau status "settlement" atau "capture" → cek apakah order sudah masuk Moka
//   4. Kalau belum → kirim order ke Moka sekarang
//   5. Kalau sudah → skip (idempotent)

import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const IS_PRODUCTION       = process.env.MIDTRANS_ENV === "production";
const MOKA_BASE           = "https://api.mokapos.com";
const SITE_URL            = "https://sectorseven.space";

// Verifikasi signature dari Midtrans agar tidak bisa dipalsukan
function verifySignature(orderId, statusCode, grossAmount, serverKey, receivedSignature) {
  const raw  = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === receivedSignature;
}

async function getMokaToken() {
  const token = process.env.MOKA_ACCESS_TOKEN;
  if (!token) throw new Error("MOKA_ACCESS_TOKEN not set");
  return token;
}

// Cek apakah order sudah masuk Moka via application_order_id
async function checkOrderExists(orderId) {
  try {
    const token    = await getMokaToken();
    const outletId = process.env.MOKA_OUTLET_ID;
    const res      = await fetch(
      `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders/${orderId}/status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Kalau 200 → order sudah ada
    return res.ok;
  } catch {
    return false;
  }
}

// Ambil pending order data dari Netlify Blobs
async function getPendingOrder(orderId) {
  try {
    const res = await fetch(`${SITE_URL}/.netlify/functions/get-pending-order?id=${orderId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Submit order ke Moka
async function submitToMoka(orderData) {
  const res  = await fetch(`${SITE_URL}/.netlify/functions/moka-checkout`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order: orderData }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `moka-checkout failed: ${res.status}`);
  return data;
}

export const handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      status_code,
      signature_key,
    } = body;

    console.log(`[midtrans-notify] order=${order_id} status=${transaction_status} fraud=${fraud_status}`);

    // 1. Verifikasi signature
    if (!verifySignature(order_id, status_code, gross_amount, MIDTRANS_SERVER_KEY, signature_key)) {
      console.error("[midtrans-notify] Invalid signature — rejected");
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Invalid signature" }) };
    }

    // 2. Hanya proses kalau pembayaran benar-benar berhasil
    const isSuccess =
      (transaction_status === "settlement") ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (!isSuccess) {
      console.log(`[midtrans-notify] Skipping — status: ${transaction_status}`);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: transaction_status }) };
    }

    // 3. Cek apakah order sudah masuk Moka (idempotency)
    const alreadyExists = await checkOrderExists(order_id);
    if (alreadyExists) {
      console.log(`[midtrans-notify] Order ${order_id} sudah ada di Moka — skip`);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "already_exists" }) };
    }

    // 4. Order belum masuk Moka — ambil data order yang tersimpan dan kirim
    console.log(`[midtrans-notify] Order ${order_id} belum ada di Moka — mengirim sekarang...`);

    const pendingOrder = await getPendingOrder(order_id);
    if (!pendingOrder) {
      console.error(`[midtrans-notify] Tidak ada pending order data untuk ${order_id}`);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: false, reason: "no_pending_order_data" }) };
    }

    await submitToMoka(pendingOrder);
    console.log(`[midtrans-notify] ✓ Order ${order_id} berhasil dikirim ke Moka`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, order_id, action: "submitted_to_moka" }),
    };

  } catch (err) {
    console.error("[midtrans-notify] Error:", err.message);
    // Return 200 agar Midtrans tidak retry terus
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};