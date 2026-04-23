/**
 * check-expired-orders.js
 * Alert ke grup kalau ada order expired di Moka — TIDAK auto-refund
 * Cek 3 lapis: Blobs status → Midtrans settlement → Moka status = "4" EXPIRED
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

async function getMokaToken() {
  if (process.env.MOKA_ACCESS_TOKEN) return process.env.MOKA_ACCESS_TOKEN;
  const res = await fetch(MOKA_BASE + "/oauth/token", {
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
  if (!res.ok) throw new Error("Moka token gagal: " + res.status);
  return data.access_token;
}

async function getMokaOrderStatus(token, orderId) {
  // Endpoint yang benar: /orders/{id}/status
  const res  = await fetch(
    MOKA_BASE + "/v1/outlets/" + MOKA_OUTLET_ID + "/advanced_orderings/orders/" + orderId + "/status",
    { headers: { Authorization: "Bearer " + token } }
  );
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {}
  const code = data?.data?.status_code;
  console.log("[moka] " + orderId + " status_code=" + code);
  return code ? String(code) : "unknown";
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

  let mokaToken = "";
  try {
    mokaToken = await getMokaToken();
  } catch (err) {
    console.error("[check-expired] Moka token gagal:", err.message);
    return { statusCode: 500, body: "Moka auth error" };
  }

  for (const key of keys) {
    try {
      const data = await store.get(key, { type: "json" });
      if (!data) continue;

      // Layer 1: skip status final
      const finalStatuses = ["completed", "rejected", "refunded", "expired", "alerted"];
      if (finalStatuses.includes(data.mokaStatus)) continue;
      if (!data.grossAmount) continue;

      const ts = data.mokaSubmittedAt || data.savedAt || data.orderTimestamp;
      if (!ts) continue;
      if (now - new Date(ts).getTime() < EXPIRED_MS) continue;

      // Layer 2: Midtrans harus settlement
      const mt = await getMidtransStatus(key);
      const txStatus = mt.transaction_status || "unknown";
      if (txStatus !== "settlement" && !(txStatus === "capture" && mt.fraud_status === "accept")) {
        // Bukan settlement → mark expired di Blobs agar tidak dicek lagi
        if (["expire", "cancel", "pending", "deny"].includes(txStatus)) {
          await store.setJSON(key, Object.assign({}, data, { mokaStatus: "expired" }));
        }
        continue;
      }

      // Layer 3: Moka harus EXPIRED ("4") — kalau completed/accepted → skip
      const mokaStatus = await getMokaOrderStatus(mokaToken, key);

      if (mokaStatus === "2" || mokaStatus === "1" || mokaStatus === "0" || mokaStatus === "6") {
        // Order selesai/aktif di Moka → update Blobs dan skip
        console.log("[check-expired] skip " + key + " — Moka status=" + mokaStatus + " (bukan expired)");
        const statusMap = { "2": "completed", "1": "submitted", "0": "submitted", "6": "completed" };
        await store.setJSON(key, Object.assign({}, data, { mokaStatus: statusMap[mokaStatus] || "submitted" }));
        continue;
      }

      if (mokaStatus !== "4" && mokaStatus !== "3") {
        console.log("[check-expired] skip " + key + " — Moka status tidak dikenal=" + mokaStatus);
        continue;
      }

      // Semua layer lolos → EXPIRED, perlu refund manual
      needsAttention.push({ orderId: key, data, nominal: formatRupiah(data.grossAmount), mokaStatus });

    } catch (err) {
      console.error("[check-expired] error " + key + ":", err.message);
    }
  }

  console.log("[check-expired] perlu perhatian=" + needsAttention.length);

  if (needsAttention.length > 0 && REFUND_GROUP_ID) {
    const lines = needsAttention.map((o) =>
      "• " + o.orderId + "\n" +
      "  Nominal : " + o.nominal + "\n" +
      "  Customer: " + (o.data.customerName || "-") + " (" + (o.data.customerPhone || "-") + ")\n" +
      "  Moka    : " + (o.mokaStatus === "4" ? "EXPIRED" : "CANCELLED")
    ).join("\n\n");

    await sendWA(REFUND_GROUP_ID,
      "⚠️ *ORDER EXPIRED — REFUND MANUAL*\n\n" +
      lines + "\n\n" +
      "Refund via Midtrans dashboard → cari Order ID → klik Refund."
    );

    for (const { orderId, data } of needsAttention) {
      try {
        await store.setJSON(orderId, Object.assign({}, data, {
          mokaStatus: "alerted",
          alertedAt:  new Date().toISOString(),
        }));
      } catch (e) {}
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ checked: keys.length, needsAttention: needsAttention.length }),
  };
};