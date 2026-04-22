/**
 * check-expired-orders.js
 * Netlify Function — dipanggil cron-job.org setiap 5 menit
 *
 * KEAMANAN BERLAPIS:
 *   Layer 1 — Blobs mokaStatus: skip kalau "completed", "rejected", "refunded", "expired"
 *   Layer 2 — Midtrans API: hanya proses kalau status = settlement
 *   Layer 3 — Moka API: hanya refund kalau status = "4" (EXPIRED) atau "3" (CANCELLED)
 *
 * Order yang completed/accepted di Moka TIDAK AKAN direfund.
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

const EXPIRED_MS = 12 * 60 * 1000; // 12 menit

// Status Moka yang AMAN untuk direfund
const REFUNDABLE_MOKA_STATUS = ["4", "3"]; // EXPIRED, CANCELLED
// Status Moka yang TIDAK BOLEH direfund
const SAFE_MOKA_STATUS = ["0", "1", "2", "6"]; // INCOMING, ACCEPTED, COMPLETED, DELIVERED

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
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    console.warn("[midtrans] bad JSON for " + orderId);
    return { transaction_status: "unknown" };
  }
}

async function getMokaToken() {
  if (process.env.MOKA_ACCESS_TOKEN) return process.env.MOKA_ACCESS_TOKEN;
  const res = await fetch(MOKA_BASE + "/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Moka token gagal: " + res.status);
  return data.access_token;
}

async function getMokaOrderStatus(token, orderId) {
  const url = MOKA_BASE + "/v1/outlets/" + MOKA_OUTLET_ID + "/advanced_orderings/orders/" + orderId;
  const res  = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) {}
  if (!res.ok) return "http_error_" + res.status;
  const code = data?.data?.[0]?.status_code
    || data?.data?.status_code
    || data?.data?.[0]?.status
    || data?.data?.status
    || "unknown";
  console.log("[moka] " + orderId + " status=" + code);
  return String(code);
}

async function refundMidtrans(orderId, amount) {
  const auth = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");
  const res  = await fetch("https://api.midtrans.com/v2/" + orderId + "/refund", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Basic " + auth,
    },
    body: JSON.stringify({
      refund_key: "refund-" + orderId,
      amount: Number(amount),
      reason: "Order kadaluarsa — tidak direspons kasir dalam 10 menit",
    }),
  });
  const data = await res.json();
  const isDup = data.status_code === "412" ||
    (data.status_message || "").toLowerCase().includes("duplicate");
  if (isDup) return Object.assign({}, data, { alreadyRefunded: true });
  if (data.status_code !== "200") throw new Error(data.status_message || "status " + data.status_code);
  return data;
}

export const handler = async (event) => {
  const secret = (event.headers || {})["x-cron-secret"] || (event.queryStringParameters || {}).secret;
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  console.log("[check-expired] Start");
  const store = getBlobsStore("pending-orders");

  let keys = [];
  try {
    const result = await store.list();
    keys = (result.blobs || []).map(function(b) { return b.key; });
  } catch (err) {
    console.error("[check-expired] list blobs gagal:", err.message);
    return { statusCode: 500, body: "Blobs error" };
  }

  const now = Date.now();
  const candidates = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const data = await store.get(key, { type: "json" });
      if (!data) continue;

      // Layer 1: Skip kalau Blobs sudah menandai status final
      const safeStatuses = ["completed", "rejected", "refunded", "expired"];
      if (safeStatuses.includes(data.mokaStatus)) continue;

      if (!data.grossAmount) continue;

      const ts = data.mokaSubmittedAt || data.savedAt || data.orderTimestamp;
      if (!ts) continue;
      if (now - new Date(ts).getTime() < EXPIRED_MS) continue;

      candidates.push({ orderId: key, data: data });
    } catch (err) {
      console.warn("[check-expired] skip " + key + ":", err.message);
    }
  }

  console.log("[check-expired] kandidat=" + candidates.length + " dari " + keys.length);
  if (!candidates.length) {
    return { statusCode: 200, body: JSON.stringify({ checked: keys.length, candidates: 0 }) };
  }

  let mokaToken = "";
  try {
    mokaToken = await getMokaToken();
  } catch (err) {
    console.error("[check-expired] moka token:", err.message);
    return { statusCode: 500, body: "Moka auth error" };
  }

  let processed = 0;
  let skipped   = 0;

  for (let i = 0; i < candidates.length; i++) {
    const orderId = candidates[i].orderId;
    const data    = candidates[i].data;
    try {
      // Layer 2: Cek Midtrans — hanya settlement yang diproses
      const mt       = await getMidtransStatus(orderId);
      const txStatus = mt.transaction_status || "unknown";

      if (txStatus !== "settlement" && !(txStatus === "capture" && mt.fraud_status === "accept")) {
        console.log("[check-expired] skip " + orderId + " midtrans=" + txStatus);
        if (["expire", "cancel", "pending"].includes(txStatus)) {
          await store.setJSON(orderId, Object.assign({}, data, {
            mokaStatus: "expired",
            expiredAt: new Date().toISOString(),
            midtransStatus: txStatus,
          }));
        }
        if (txStatus === "refund" || txStatus === "partial_refund") {
          await store.setJSON(orderId, Object.assign({}, data, { mokaStatus: "refunded" }));
        }
        skipped++;
        continue;
      }

      // Layer 3: Cek Moka — HANYA refund kalau status EXPIRED atau CANCELLED
      const mokaStatus = await getMokaOrderStatus(mokaToken, orderId);

      if (SAFE_MOKA_STATUS.includes(mokaStatus)) {
        console.log("[check-expired] AMAN — skip " + orderId + " moka=" + mokaStatus + " (order masih aktif/selesai)");
        // Update Blobs kalau completed
        if (mokaStatus === "2") {
          await store.setJSON(orderId, Object.assign({}, data, { mokaStatus: "completed" }));
        }
        skipped++;
        continue;
      }

      if (!REFUNDABLE_MOKA_STATUS.includes(mokaStatus)) {
        console.log("[check-expired] skip " + orderId + " moka status tidak dikenal=" + mokaStatus);
        skipped++;
        continue;
      }

      // Semua layer lolos → refund
      console.log("[check-expired] REFUND " + orderId + " moka=" + mokaStatus);
      const nominal = formatRupiah(data.grossAmount);
      let refundOk  = false;

      try {
        const r = await refundMidtrans(orderId, data.grossAmount);
        refundOk = true;
        if (r.alreadyRefunded) {
          console.log("[check-expired] " + orderId + " sudah pernah direfund");
        }
      } catch (err) {
        console.error("[check-expired] refund gagal " + orderId + ":", err.message);
        if (REFUND_GROUP_ID) {
          await sendWA(REFUND_GROUP_ID,
            "⚠️ *ORDER EXPIRED — REFUND GAGAL*\n\n" +
            "Order ID : " + orderId + "\n" +
            "Nominal  : " + nominal + "\n" +
            "Error    : " + err.message + "\n\n" +
            "Proses manual via Midtrans dashboard."
          );
        }
      }

      if (data.customerPhone) {
        await sendWA(data.customerPhone,
          refundOk
            ? "😔 *Pesananmu kadaluarsa*\n\n" +
              "Halo " + (data.customerName || "Kak") + ", pesananmu *" + orderId + "* tidak sempat diproses kasir dalam 10 menit.\n\n" +
              "✅ *Refund " + nominal + " sudah otomatis diproses.*\n" +
              "Dana kembali dalam beberapa menit hingga 1 hari kerja.\n\n" +
              "_Sector Seven Coffee_"
            : "😔 *Pesananmu kadaluarsa*\n\n" +
              "Halo " + (data.customerName || "Kak") + ", pesananmu *" + orderId + "* tidak sempat diproses kasir.\n\n" +
              "Refund " + nominal + " akan kami proses dalam 2 jam 🙏\n\n" +
              "_Sector Seven Coffee_"
        );
      }

      await store.setJSON(orderId, Object.assign({}, data, {
        mokaStatus: "expired",
        expiredAt: new Date().toISOString(),
        refundSuccess: refundOk,
        mokaStatusCode: mokaStatus,
      }));

      processed++;

    } catch (err) {
      console.error("[check-expired] gagal " + orderId + ":", err.message);
    }
  }

  console.log("[check-expired] done processed=" + processed + " skipped=" + skipped);
  return {
    statusCode: 200,
    body: JSON.stringify({ checked: keys.length, candidates: candidates.length, processed: processed, skipped: skipped }),
  };
};