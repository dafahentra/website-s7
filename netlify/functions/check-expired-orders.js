/**
 * check-expired-orders.js
 * Netlify Function — dipanggil cron-job.org setiap 5 menit
 *
 * Flow:
 *   1. List Blobs pending-orders, filter kandidat (> 12 menit, punya grossAmount)
 *   2. Cek Midtrans — hanya proses kalau status = settlement
 *      - pending/expire = belum/gagal bayar → skip (tidak perlu refund)
 *      - refund/cancel  = sudah direfund manual → skip
 *      - settlement     = sudah bayar, belum direfund → lanjut
 *   3. Cek Moka — kalau status EXPIRED (4) atau tidak ditemukan → refund
 *   4. Auto-refund Midtrans → WA customer → update Blobs
 */

import { getStore } from "@netlify/blobs";

const MOKA_BASE           = "https://api.mokapos.com";
const NETLIFY_SITE_ID     = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN   = process.env.NETLIFY_API_TOKEN;
const FONNTE_TOKEN        = process.env.FONNTE_TOKEN;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const REFUND_GROUP_ID     = process.env.REFUND_GROUP_ID;
const MOKA_OUTLET_ID      = process.env.MOKA_OUTLET_ID;
const CRON_SECRET         = process.env.CRON_SECRET;

const EXPIRED_THRESHOLD_MS = 12 * 60 * 1000; // 12 menit

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

// ── Midtrans: cek status transaksi ────────────────────────────────────────────
async function getMidtransStatus(orderId) {
  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  const res  = await fetch(`https://api.midtrans.com/v2/${orderId}/status`, {
    headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.warn(`[midtrans-status] ${orderId} — response bukan JSON: ${text.slice(0, 100)}`);
    data = { transaction_status: "unknown" };
  }
  console.log(`[midtrans-status] ${orderId} → ${data.transaction_status} | fraud: ${data.fraud_status}`);
  return data;
}

// ── Moka: cek status order ────────────────────────────────────────────────────
async function getMokaToken() {
  if (process.env.MOKA_ACCESS_TOKEN) return process.env.MOKA_ACCESS_TOKEN;
  const res = await fetch(`${MOKA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moka token gagal: ${res.status}`);
  return data.access_token;
}

async function getMokaOrderStatus(token, orderId) {
  const res  = await fetch(
    `${MOKA_BASE}/v1/outlets/${MOKA_OUTLET_ID}/advanced_orderings/orders/${orderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.warn(`[moka-status] ${orderId} — response bukan JSON: ${text.slice(0, 100)}`);
  }
  console.log(`[moka-status] ${orderId} → http ${res.status} | raw: ${JSON.stringify(data).slice(0, 200)}`);
  if (!res.ok) return `http_error_${res.status}`;
  const statusCode = data?.data?.[0]?.status_code
    || data?.data?.status_code
    || data?.data?.[0]?.status
    || data?.data?.status
    || "unknown";
  return String(statusCode);
}

// ── Midtrans: refund ──────────────────────────────────────────────────────────
async function refundMidtrans(orderId, amount) {
  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  const res = await fetch(`https://api.midtrans.com/v2/${orderId}/refund`, {
    method:  "POST",
    headers: {
      Accept:          "application/json",
      "Content-Type":  "application/json",
      Authorization:   `Basic ${auth}`,
    },
    body: JSON.stringify({
      refund_key: `refund-${orderId}`,
      amount:     Number(amount),
      reason:     "Order kadaluarsa — tidak direspons kasir dalam 10 menit",
    }),
  });
  const data = await res.json();
  const isDuplicate = data.status_code === "412" ||
    (data.status_message || "").toLowerCase().includes("duplicate");
  if (isDuplicate) return { ...data, alreadyRefunded: true };
  if (data.status_code !== "200") throw new Error(data.status_message || `status ${data.status_code}`);
  return data;
}

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target, message, countryCode: "62" }),
    });
    return res.json();
  } catch (err) {
    console.error(`[sendWA] ${err.message}`);
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const incomingSecret = event.headers["x-cron-secret"] || event.queryStringParameters?.secret;
  if (CRON_SECRET && incomingSecret !== CRON_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  console.log("[check-expired-orders] Start");

  const store = getBlobsStore("pending-orders");

  let keys = [];
  try {
    const result = await store.list();
    keys = result.blobs?.map((b) => b.key) || [];
  } catch (err) {
    console.error("[check-expired-orders] List Blobs gagal:", err.message);
    return { statusCode: 500, body: "Blobs error" };
  }

  const now        = Date.now();
  const candidates = [];

  for (const key of keys) {
    try {
      const data = await store.get(key, { type: "json" });
      if (!data) continue;
      if (["expired", "refunded"].includes(data.mokaStatus)) continue;
      if (!data.grossAmount) continue;

      const refTs = data.mokaSubmittedAt || data.savedAt || data.orderTimestamp;
      if (!refTs) continue;
      if (now - new Date(refTs).getTime() < EXPIRED_THRESHOLD_MS) continue;

      candidates.push({ orderId: key, data });
    } catch { /* skip */ }
  }

  console.log(`[check-expired-orders] Kandidat: ${candidates.length} dari ${keys.length}`);

  if (!candidates.length) {
    return { statusCode: 200, body: JSON.stringify({ checked: keys.length, candidates: 0 }) };
  }

  let mokaToken;
  try {
    mokaToken = await getMokaToken();
  } catch (err) {
    console.error("[check-expired-orders] Moka token gagal:", err.message);
    return { statusCode: 500, body: "Moka auth error" };
  }

  let processed = 0;
  let skipped   = 0;

  for (const { orderId, data } of candidates) {
    try {
      // ── Step 1: Cek Midtrans dulu ───────────────────────────────────────────
      const midtrans = await getMidtransStatus(orderId);
      const txStatus = midtrans.transaction_status || "unknown";
      const fraudOk  = midtrans.fraud_status === "accept" || midtrans.fraud_status === undefined;

      // Belum bayar atau sudah expire di Midtrans → tidak perlu refund
      if (["pending", "expire", "cancel", "deny", "unknown"].includes(txStatus)) {
        console.log(`[check-expired-orders] ${orderId} skip — Midtrans: ${txStatus}`);
        // Update Blobs agar tidak dicek lagi
        await store.setJSON(orderId, { ...data, mokaStatus: "expired", expiredAt: new Date().toISOString(), refundSuccess: false, midtransStatus: txStatus });
        skipped++;
        continue;
      }

      // Sudah direfund (lewat tombol Midtrans dashboard atau sebelumnya) → skip
      if (["refund", "partial_refund"].includes(txStatus)) {
        console.log(`[check-expired-orders] ${orderId} skip — sudah direfund: ${txStatus}`);
        await store.setJSON(orderId, { ...data, mokaStatus: "refunded", refundSuccess: true, midtransStatus: txStatus });
        skipped++;
        continue;
      }

      // settlement (atau capture+accept) = sudah bayar, belum direfund → lanjut
      const isSettled = txStatus === "settlement" || (txStatus === "capture" && fraudOk);
      if (!isSettled) {
        console.log(`[check-expired-orders] ${orderId} skip — status tidak dikenal: ${txStatus}`);
        skipped++;
        continue;
      }

      // ── Step 2: Cek Moka ────────────────────────────────────────────────────
      const mokaStatus = await getMokaOrderStatus(mokaToken, orderId);
      console.log(`[check-expired-orders] ${orderId} — Moka status: ${mokaStatus}`);

      // Kalau order masih aktif di Moka (accepted/incoming) → jangan refund dulu
      if (["0", "1", "2", "6"].includes(mokaStatus)) {
        console.log(`[check-expired-orders] ${orderId} skip — masih aktif di Moka: ${mokaStatus}`);
        skipped++;
        continue;
      }

      // Status 4 = EXPIRED, 3 = CANCELLED, unknown/error = tidak ditemukan → refund
      const { grossAmount, customerPhone, customerName } = data;
      const nominalText = formatRupiah(grossAmount);

      let refundSuccess = false;
      try {
        const refundResult = await refundMidtrans(orderId, grossAmount);
        refundSuccess = true;
        if (refundResult.alreadyRefunded) {
          console.log(`[check-expired-orders] ${orderId} sudah pernah direfund sebelumnya`);
        } else {
          console.log(`[check-expired-orders] Refund OK: ${orderId}`);
        }
      } catch (err) {
        console.error(`[check-expired-orders] Refund gagal ${orderId}: ${err.message}`);
        if (REFUND_GROUP_ID) {
          await sendWA(REFUND_GROUP_ID,
            `⚠️ *ORDER EXPIRED — REFUND GAGAL*\n\n` +
            `Order ID : ${orderId}\n` +
            `Nominal  : ${nominalText}\n` +
            `Error    : ${err.message}\n\n` +
            `Proses manual via Midtrans dashboard.`
          );
        }
      }

      if (customerPhone) {
        await sendWA(customerPhone,
          refundSuccess
            ? `😔 *Pesananmu kadaluarsa*\n\n` +
              `Halo ${customerName || "Kak"}, pesananmu *${orderId}* tidak sempat diproses kasir.\n\n` +
              `✅ *Refund ${nominalText} sudah otomatis diproses.*\n` +
              `Dana kembali dalam beberapa menit hingga 1 hari kerja.\n\n` +
              `_Sector Seven Coffee_`
            : `😔 *Pesananmu kadaluarsa*\n\n` +
              `Halo ${customerName || "Kak"}, pesananmu *${orderId}* tidak sempat diproses kasir.\n\n` +
              `Refund ${nominalText} akan kami proses dalam 2 jam 🙏\n\n` +
              `_Sector Seven Coffee_`
        );
      }

      await store.setJSON(orderId, {
        ...data,
        mokaStatus:     "expired",
        expiredAt:      new Date().toISOString(),
        refundSuccess,
        midtransStatus: txStatus,
        mokaStatusCode: mokaStatus,
      });

      processed++;

    } catch (err) {
      console.error(`[check-expired-orders] Error ${orderId}: ${err.message}`);
    }
  }

  console.log(`[check-expired-orders] Done — processed: ${processed} skipped: ${skipped}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ checked: keys.length, candidates: candidates.length, processed, skipped }),
  };
};