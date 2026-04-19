/**
 * retry-order.js
 * Netlify Function — Retry manual submit order ke Moka
 *
 * Dipanggil admin lewat link WA:
 * GET /.netlify/functions/retry-order?id=ORDER_ID&token=TOKEN
 *
 * Response berupa halaman HTML sederhana agar bisa dibuka dari HP.
 */

import crypto from "crypto";
import { getStore } from "@netlify/blobs";

const MOKA_OUTLET_ID = process.env.MOKA_OUTLET_ID;
const MOKA_EMAIL = process.env.MOKA_EMAIL;
const MOKA_PASSWORD = process.env.MOKA_PASSWORD;
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const ADMIN_WA_TARGET = process.env.ADMIN_WA_NUMBER;
const RETRY_SECRET = process.env.RETRY_SECRET || "s7-retry-secret-2024";

// ─── Utility ───────────────────────────────────────────────────────────────────

function generateRetryToken(orderId) {
  return crypto
    .createHmac("sha256", RETRY_SECRET)
    .update(orderId)
    .digest("hex")
    .slice(0, 16);
}

function htmlResponse(title, message, isSuccess) {
  const color = isSuccess ? "#22c55e" : "#ef4444";
  const icon = isSuccess ? "✅" : "❌";
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Sector Seven</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: ${color}; }
    .message { font-size: 14px; color: #888; line-height: 1.6; }
    .order-id { 
      margin-top: 16px;
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px 14px;
      font-family: monospace;
      font-size: 13px;
      color: #ccc;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <div class="title">${title}</div>
    <div class="message">${message}</div>
  </div>
</body>
</html>`;
}

// ─── Moka helpers ──────────────────────────────────────────────────────────────

async function getMokaToken() {
  const response = await fetch("https://api.mokapos.com/api/v1/auth/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: MOKA_EMAIL, password: MOKA_PASSWORD }),
  });
  if (!response.ok) throw new Error(`Moka auth failed: ${response.status}`);
  const data = await response.json();
  return data.data?.access_token;
}

async function submitOrderToMoka(orderData) {
  const token = await getMokaToken();
  const response = await fetch(
    `https://api.mokapos.com/api/v2/outlets/${MOKA_OUTLET_ID}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    }
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(`Moka order failed (${response.status}): ${JSON.stringify(result)}`);
  return result;
}

async function sendWA(target, message) {
  try {
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });
  } catch (err) {
    console.error("[sendWA] Error:", err.message);
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const { id: orderId, token } = event.queryStringParameters || {};

  // Validasi parameter
  if (!orderId || !token) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse("Link Tidak Valid", "Parameter order ID atau token tidak ditemukan.", false),
    };
  }

  // Validasi token
  const expectedToken = generateRetryToken(orderId);
  if (token !== expectedToken) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse("Akses Ditolak", "Token tidak valid.", false),
    };
  }

  // Ambil data dari Blobs
  let pendingData;
  try {
    const store = getStore("pending-orders");
    pendingData = await store.get(orderId, { type: "json" });
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse("Error", `Gagal mengakses data: ${err.message}`, false),
    };
  }

  if (!pendingData) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse(
        "Order Tidak Ditemukan",
        `Order <strong>${orderId}</strong> tidak ditemukan di sistem. Mungkin sudah berhasil diproses sebelumnya.`,
        false
      ),
    };
  }

  // Coba submit ke Moka
  try {
    await submitOrderToMoka(pendingData.orderData);

    // Sukses — hapus dari Blobs
    const store = getStore("pending-orders");
    await store.delete(orderId);

    // Notif ke grup admin
    if (ADMIN_WA_TARGET) {
      await sendWA(
        ADMIN_WA_TARGET,
        `✅ *RETRY BERHASIL*\n\nOrder ${orderId} sudah berhasil masuk ke Moka.\nDiproses via link retry manual.`
      );
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse(
        "Berhasil!",
        `Order <strong>${orderId}</strong> sudah berhasil dikirim ke Moka. Barista akan segera memproses pesanan.`,
        true
      ),
    };
  } catch (err) {
    // Gagal — update retry count di Blobs
    try {
      const store = getStore("pending-orders");
      await store.setJSON(orderId, {
        ...pendingData,
        retryCount: (pendingData.retryCount || 0) + 1,
        lastRetryAt: new Date().toISOString(),
        lastError: err.message,
      });
    } catch (_) {}

    // Notif ke grup admin
    if (ADMIN_WA_TARGET) {
      await sendWA(
        ADMIN_WA_TARGET,
        `❌ *RETRY GAGAL*\n\nOrder ${orderId} masih gagal masuk Moka.\nError: ${err.message}\n\nProses manual langsung di Moka POS.`
      );
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: htmlResponse(
        "Retry Gagal",
        `Order <strong>${orderId}</strong> masih gagal masuk ke Moka.<br><br><small style="color:#666">${err.message}</small><br><br>Silakan proses manual langsung di Moka POS.`,
        false
      ),
    };
  }
};