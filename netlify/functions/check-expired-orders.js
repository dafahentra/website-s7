/**
 * check-expired-orders.js
 * Netlify Function — HTTP endpoint, dipanggil cron-job.org setiap 5 menit
 *
 * Setup cron-job.org:
 *   URL    : https://sectorseven.space/.netlify/functions/check-expired-orders
 *   Method : GET
 *   Header : x-cron-secret: <CRON_SECRET>
 *   Every  : 5 minutes
 *
 * ENV: CRON_SECRET, MOKA_OUTLET_ID, MOKA_ACCESS_TOKEN, MOKA_REFRESH_TOKEN,
 *      MOKA_CLIENT_ID, MOKA_SECRET, MIDTRANS_SERVER_KEY, FONNTE_TOKEN,
 *      NETLIFY_SITE_ID, NETLIFY_API_TOKEN, REFUND_GROUP_ID
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

// 12 menit — Moka expire setelah 10 menit, tambah 2 menit buffer
const EXPIRED_THRESHOLD_MS = 12 * 60 * 1000;

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

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
  const res = await fetch(
    `${MOKA_BASE}/v1/outlets/${MOKA_OUTLET_ID}/advanced_orderings/orders/${orderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Moka status gagal: ${res.status}`);
  return data?.data?.[0]?.status || data?.data?.status || null;
}

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

export const handler = async (event) => {
  // ── Security ────────────────────────────────────────────────────────────────
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
    console.error("[check-expired-orders] Gagal list Blobs:", err.message);
    return { statusCode: 500, body: "Blobs list error" };
  }

  const now        = Date.now();
  const candidates = [];

  for (const key of keys) {
    try {
      const data = await store.get(key, { type: "json" });
      if (!data) continue;

      // Skip yang sudah final
      if (["expired", "completed", "rejected"].includes(data.mokaStatus)) continue;

      // Gunakan mokaSubmittedAt jika ada, fallback ke savedAt (order lama)
      const refTs = data.mokaSubmittedAt || data.savedAt || data.orderTimestamp;
      if (!refTs) continue;

      const agems = now - new Date(refTs).getTime();
      if (agems < EXPIRED_THRESHOLD_MS) continue;

      // Harus punya grossAmount untuk bisa refund
      if (!data.grossAmount) continue;

      candidates.push({ orderId: key, data, agems });
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

  for (const { orderId, data } of candidates) {
    try {
      const mokaStatus = await getMokaOrderStatus(mokaToken, orderId);
      console.log(`[check-expired-orders] ${orderId} → Moka status: ${mokaStatus}`);

      // "4" = EXPIRED, null/error = tidak ketemu di Moka (mungkin tidak pernah masuk)
      // Keduanya perlu direfund karena customer sudah bayar
      const shouldRefund = mokaStatus === "4" || mokaStatus === null;
      if (!shouldRefund) continue;

      const { grossAmount, customerPhone, customerName } = data;
      const nominalText = formatRupiah(grossAmount);

      let refundSuccess = false;
      try {
        await refundMidtrans(orderId, grossAmount);
        refundSuccess = true;
        console.log(`[check-expired-orders] Refund OK: ${orderId}`);
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
        mokaStatus:   "expired",
        expiredAt:    new Date().toISOString(),
        refundSuccess,
      });

      processed++;

    } catch (err) {
      console.error(`[check-expired-orders] Error ${orderId}: ${err.message}`);
    }
  }

  console.log(`[check-expired-orders] Done — processed: ${processed}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ checked: keys.length, candidates: candidates.length, processed }),
  };
};