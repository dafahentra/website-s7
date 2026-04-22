/**
 * check-expired-orders.js
 * Netlify Function — dipanggil cron-job.org setiap 5 menit
 * ESM — di-bundle esbuild via netlify.toml node_bundler = "esbuild"
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
const EXPIRED_MS          = 12 * 60 * 1000;

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
    const data = text ? JSON.parse(text) : {};
    console.log("[midtrans] " + orderId + " -> " + data.transaction_status);
    return data;
  } catch (e) {
    console.warn("[midtrans] bad JSON for " + orderId + ": " + text.slice(0, 80));
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
  try { data = text ? JSON.parse(text) : {}; } catch (e) { /* ignore */ }
  console.log("[moka] " + orderId + " http=" + res.status + " raw=" + JSON.stringify(data).slice(0, 150));
  if (!res.ok) return "http_error_" + res.status;
  const code = data?.data?.[0]?.status_code
    || data?.data?.status_code
    || data?.data?.[0]?.status
    || data?.data?.status
    || "unknown";
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
      if (data.mokaStatus === "expired" || data.mokaStatus === "refunded") continue;
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
      // Step 1: cek Midtrans
      const mt       = await getMidtransStatus(orderId);
      const txStatus = mt.transaction_status || "unknown";
      const fraudOk  = !mt.fraud_status || mt.fraud_status === "accept";

      if (txStatus === "pending" || txStatus === "expire" || txStatus === "cancel" || txStatus === "deny" || txStatus === "unknown") {
        console.log("[check-expired] skip " + orderId + " midtrans=" + txStatus);
        await store.setJSON(orderId, Object.assign({}, data, { mokaStatus: "expired", expiredAt: new Date().toISOString(), midtransStatus: txStatus }));
        skipped++;
        continue;
      }
      if (txStatus === "refund" || txStatus === "partial_refund") {
        console.log("[check-expired] skip " + orderId + " sudah refund");
        await store.setJSON(orderId, Object.assign({}, data, { mokaStatus: "refunded", refundSuccess: true, midtransStatus: txStatus }));
        skipped++;
        continue;
      }

      const settled = txStatus === "settlement" || (txStatus === "capture" && fraudOk);
      if (!settled) {
        console.log("[check-expired] skip " + orderId + " status=" + txStatus);
        skipped++;
        continue;
      }

      // Step 2: cek Moka
      const mokaStatus = await getMokaOrderStatus(mokaToken, orderId);
      if (mokaStatus === "0" || mokaStatus === "1" || mokaStatus === "2" || mokaStatus === "6") {
        console.log("[check-expired] skip " + orderId + " moka aktif=" + mokaStatus);
        skipped++;
        continue;
      }

      // Step 3: refund
      const nominal = formatRupiah(data.grossAmount);
      let refundOk  = false;

      try {
        const r = await refundMidtrans(orderId, data.grossAmount);
        refundOk = true;
        if (r.alreadyRefunded) {
          console.log("[check-expired] " + orderId + " sudah pernah direfund");
        } else {
          console.log("[check-expired] refund OK " + orderId);
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
        const name = data.customerName || "Kak";
        await sendWA(data.customerPhone,
          refundOk
            ? "😔 *Pesananmu kadaluarsa*\n\n" +
              "Halo " + name + ", pesananmu *" + orderId + "* tidak sempat diproses kasir.\n\n" +
              "✅ *Refund " + nominal + " sudah otomatis diproses.*\n" +
              "Dana kembali dalam beberapa menit hingga 1 hari kerja.\n\n" +
              "_Sector Seven Coffee_"
            : "😔 *Pesananmu kadaluarsa*\n\n" +
              "Halo " + name + ", pesananmu *" + orderId + "* tidak sempat diproses kasir.\n\n" +
              "Refund " + nominal + " akan kami proses dalam 2 jam 🙏\n\n" +
              "_Sector Seven Coffee_"
        );
      }

      await store.setJSON(orderId, Object.assign({}, data, {
        mokaStatus: "expired",
        expiredAt: new Date().toISOString(),
        refundSuccess: refundOk,
        midtransStatus: txStatus,
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