/**
 * check-expired-orders.js
 * Cek order expired — ALERT SAJA ke grup, tidak auto-refund
 * Refund dilakukan manual oleh admin via Midtrans dashboard
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

const EXPIRED_MS = 12 * 60 * 1000;

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });
    return res.json();
  } catch (err) {
    console.error("[sendWA]", err.message);
  }
}

async function getMidtransStatus(orderId) {
  const auth = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");
  const res  = await fetch("https://api.midtrans.com/v2/" + orderId + "/status", {
    headers: { Accept: "application/json", Authorization: "Basic " + auth },
  });
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; }
  catch (e) { return { transaction_status: "unknown" }; }
}

export const handler = async (event) => {
  if (!CRON_SECRET) return { statusCode: 500, body: "CRON_SECRET tidak diset" };
  const secret = (event.headers || {})["x-cron-secret"];
  if (secret !== CRON_SECRET) return { statusCode: 401, body: "Unauthorized" };

  const store = getBlobsStore("pending-orders");
  let keys = [];
  try {
    const result = await store.list();
    keys = (result.blobs || []).map((b) => b.key);
  } catch (err) {
    return { statusCode: 500, body: "Blobs error" };
  }

  const now = Date.now();
  const needsAttention = [];

  for (const key of keys) {
    try {
      const data = await store.get(key, { type: "json" });
      if (!data) continue;
      if (["completed", "rejected", "refunded", "expired", "alerted"].includes(data.mokaStatus)) continue;
      if (!data.grossAmount) continue;

      const ts = data.mokaSubmittedAt || data.savedAt || data.orderTimestamp;
      if (!ts) continue;
      if (now - new Date(ts).getTime() < EXPIRED_MS) continue;

      // Cek Midtrans — hanya alert kalau sudah settlement
      const mt = await getMidtransStatus(key);
      const txStatus = mt.transaction_status || "unknown";

      if (txStatus !== "settlement" && !(txStatus === "capture" && mt.fraud_status === "accept")) continue;

      needsAttention.push({ orderId: key, data, nominal: formatRupiah(data.grossAmount) });

    } catch (err) {
      console.error("[check-expired] error " + key + ":", err.message);
    }
  }

  console.log("[check-expired] perlu perhatian=" + needsAttention.length);

  if (needsAttention.length > 0 && REFUND_GROUP_ID) {
    const lines = needsAttention.map((o) =>
      "• " + o.orderId + " — " + o.nominal + " — " + (o.data.customerName || "-") + " (" + (o.data.customerPhone || "-") + ")"
    ).join("\n");

    await sendWA(REFUND_GROUP_ID,
      "⚠️ *ORDER EXPIRED — PERLU REFUND MANUAL*\n\n" +
      "Order berikut sudah bayar tapi tidak masuk/expired di Moka:\n\n" +
      lines + "\n\n" +
      "Refund via Midtrans dashboard → cari order ID → klik Refund."
    );

    // Mark sebagai sudah di-alert agar tidak alert ulang
    for (const { orderId, data } of needsAttention) {
      try {
        await store.setJSON(orderId, Object.assign({}, data, {
          mokaStatus: "alerted",
          alertedAt: new Date().toISOString(),
        }));
      } catch (e) {}
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ checked: keys.length, needsAttention: needsAttention.length }),
  };
};