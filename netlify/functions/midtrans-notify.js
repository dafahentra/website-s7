/**
 * midtrans-notify.js
 * Netlify Function — Webhook handler notifikasi pembayaran dari Midtrans
 *
 * Flow:
 *   1. Terima webhook → validasi signature
 *   2. Cek settlement / capture+accept
 *   3. Baca orderData dari Blobs (key = orderData, disimpan oleh save-pending-order.js)
 *   4. Submit order ke Moka via moka-checkout
 *   5. Simpan grossAmount ke Blobs (dipakai moka-callback saat rejected)
 *   6. Kirim WA receipt ke customer
 */

import crypto from "crypto";
import { getStore } from "@netlify/blobs";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const FONNTE_TOKEN        = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID     = process.env.REFUND_GROUP_ID;
const NETLIFY_SITE_ID     = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN   = process.env.NETLIFY_API_TOKEN;
const SITE_URL            = process.env.URL || "https://sectorseven.space";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

function validateSignature(orderId, statusCode, grossAmount, signatureKey) {
  const raw  = orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === signatureKey;
}

function formatWaktuWIB(dateStr) {
  const date = dateStr
    ? new Date(dateStr.replace(" ", "T") + "+07:00")
    : new Date();
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day:      "2-digit",
    month:    "long",
    year:     "numeric",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }) + " WIB";
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style:                "currency",
    currency:             "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target, message, countryCode: "62" }),
    });
    const result = await res.json();
    console.log(`[sendWA] → ${target} | status: ${result?.status}`);
    return result;
  } catch (err) {
    console.error("[sendWA] Error:", err.message);
    return null;
  }
}

async function submitOrderToMoka(orderData) {
  const res = await fetch(`${SITE_URL}/.netlify/functions/moka-checkout`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order: orderData }),
  });
  const data = await res.json().catch(() => ({}));

  // Duplicate = order sudah ada di Moka sebelumnya → treat sebagai sukses
  const errMsg = data?.error || "";
  if (!res.ok && errMsg.toLowerCase().includes("duplicate")) {
    console.log("[midtrans-notify] Order sudah ada di Moka (duplicate) — skip, lanjut");
    return data;
  }

  if (!res.ok) throw new Error(errMsg || `moka-checkout error ${res.status}`);
  console.log("[midtrans-notify] Order masuk ke Moka");
  return data;
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

  console.log(`[midtrans-notify] ${order_id} — status: ${transaction_status}`);

  // ── 1. Validasi signature ─────────────────────────────────────────────────────
  if (!validateSignature(order_id, status_code, gross_amount, signature_key)) {
    console.error("[midtrans-notify] Signature tidak valid!");
    return { statusCode: 403, body: "Invalid signature" };
  }

  // ── 2. Cek settlement ─────────────────────────────────────────────────────────
  const isSettled =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!isSettled) {
    console.log(`[midtrans-notify] Status ${transaction_status} — skip`);
    return { statusCode: 200, body: "OK" };
  }

  // ── 3. Baca data dari Blobs ───────────────────────────────────────────────────
  let pendingData   = null;
  let customerPhone = null;
  let customerName  = "Pelanggan";
  let orderItems    = [];
  let orderData     = null;

  try {
    const store = getBlobsStore("pending-orders");
    pendingData = await store.get(order_id, { type: "json" });

    if (pendingData) {
      // Idempotency guard — kalau sudah diproses sebelumnya, skip Moka submit
      if (pendingData.mokaStatus === "submitted" || pendingData.mokaStatus === "expired" || pendingData.mokaStatus === "refunded") {
        console.log(`[midtrans-notify] ${order_id} sudah pernah diproses (${pendingData.mokaStatus}) — skip Moka submit, kirim WA saja`);
        orderData = null; // skip submit ke Moka
      } else {
        orderData = pendingData.orderData || null;
      }
      customerPhone = pendingData.customerPhone || null;
      customerName  = pendingData.customerName  || "Pelanggan";
      orderItems    = pendingData.items         || [];
      console.log(`[Blobs] Data ditemukan — phone: ${customerPhone} | orderData: ${!!orderData} | status: ${pendingData.mokaStatus || "new"}`);
    } else {
      console.warn(`[Blobs] Tidak ada data untuk ${order_id}`);
    }
  } catch (err) {
    console.error(`[Blobs] Error: ${err.message}`);
  }

  // ── 4. Submit order ke Moka ───────────────────────────────────────────────────
  if (orderData) {
    try {
      // Validasi item_id tidak boleh null/blank
      const invalidItems = (orderData.order_items || []).filter((i) => !i.item_id);
      if (invalidItems.length > 0) {
        throw new Error(
          "item_id null untuk: " + invalidItems.map((i) => i.item_name || "?").join(", ")
        );
      }
      await submitOrderToMoka(orderData);
      // Simpan timestamp submit ke Moka — dipakai check-expired-orders untuk deteksi EXPIRED
      if (pendingData) {
        try {
          const store = getBlobsStore("pending-orders");
          await store.setJSON(order_id, {
            ...pendingData,
            grossAmount:     gross_amount,
            mokaSubmittedAt: new Date().toISOString(),
            mokaStatus:      "submitted",
          });
        } catch (e) {
          console.error("[midtrans-notify] Gagal update mokaSubmittedAt:", e.message);
        }
      }
    } catch (err) {
      console.error("[midtrans-notify] Moka submit gagal:", err.message);

      // ── Auto-refund ke Midtrans karena order tidak bisa masuk Moka ───────────
      let refundSuccess = false;
      try {
        const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
        const refundRes = await fetch(`https://api.midtrans.com/v2/${order_id}/refund`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            refund_key: `refund-${order_id}`,
            amount:     Number(gross_amount),
            reason:     "Pesanan gagal diproses sistem — refund otomatis",
          }),
        });
        const refundData = await refundRes.json();
        const isDuplicate = refundData.status_code === "412" ||
          (refundData.status_message || "").toLowerCase().includes("duplicate");
        if (isDuplicate || refundData.status_code === "200") {
          refundSuccess = true;
          console.log(`[midtrans-notify] Auto refund OK untuk ${order_id}`);
        } else {
          throw new Error(refundData.status_message || `status ${refundData.status_code}`);
        }
      } catch (refundErr) {
        console.error("[midtrans-notify] Auto refund gagal:", refundErr.message);
      }

      // Alert ke grup
      if (REFUND_GROUP_ID) {
        await sendWA(
          REFUND_GROUP_ID,
          `⚠️ *MOKA SUBMIT GAGAL*\n\n` +
          `Order ID : ${order_id}\n` +
          `Total    : ${formatRupiah(gross_amount)}\n` +
          `Error    : ${err.message}\n\n` +
          (refundSuccess
            ? `✅ Refund sudah otomatis diproses ke customer.`
            : `❌ Auto refund juga gagal. Proses manual via Midtrans dashboard.`)
        );
      }

      // WA ke customer
      if (customerPhone) {
        await sendWA(customerPhone,
          refundSuccess
            ? `😔 *Pesananmu tidak bisa diproses*\n\n` +
              `Halo ${customerName}, terjadi kendala teknis saat memproses pesananmu.\n\n` +
              `✅ *Refund ${formatRupiah(gross_amount)} sudah otomatis diproses.*\n` +
              `Dana kembali dalam beberapa menit hingga 1 hari kerja.\n\n` +
              `_Sector Seven Coffee_`
            : `😔 *Pesananmu tidak bisa diproses*\n\n` +
              `Halo ${customerName}, terjadi kendala teknis saat memproses pesananmu.\n\n` +
              `Tim kami akan memproses refund ${formatRupiah(gross_amount)} dalam 2 jam 🙏\n\n` +
              `_Sector Seven Coffee_`
        );
      }
    }
  } else {
    console.warn(`[midtrans-notify] orderData null untuk ${order_id} — skip Moka submit`);
  }

  // ── 5. Notif ke grup TEST + ntfy ─────────────────────────────────────────────
  const itemListGrup = orderItems.length > 0
    ? orderItems.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
    : "-";

  const grupMsg =
    `🛎️ *ORDER ONLINE MASUK*\n\n` +
    `Order ID : ${order_id}\n` +
    `Total    : ${formatRupiah(gross_amount)}\n` +
    `Waktu    : ${formatWaktuWIB(transaction_time)}\n` +
    `Customer : ${customerName}\n` +
    `HP       : ${customerPhone || "-"}\n\n` +
    `Menu:\n${itemListGrup}`;

  const notifTasks = [];

  if (REFUND_GROUP_ID) {
    notifTasks.push(sendWA(REFUND_GROUP_ID, grupMsg));
  }

  // ntfy push notification ke tablet
  const NTFY_TOPIC = process.env.NTFY_TOPIC;
  if (NTFY_TOPIC) {
    notifTasks.push(
      fetch("https://ntfy.sh/" + NTFY_TOPIC, {
        method: "POST",
        headers: {
          "Title":    "Order Masuk! " + formatRupiah(gross_amount),
          "Priority": "urgent",
          "Tags":     "bell,coffee",
          "Content-Type": "text/plain; charset=utf-8",
        },
        body: customerName + " - " + formatRupiah(gross_amount) + "\n" + itemListGrup,
      }).catch((e) => console.error("[ntfy] gagal:", e.message))
    );
  }

  await Promise.allSettled(notifTasks);

  // ── 6. Kirim WA receipt ke customer ─────────────────────────────────────────
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
    console.warn(`[WA] customerPhone tidak ditemukan untuk ${order_id}`);
    if (REFUND_GROUP_ID) {
      await sendWA(
        REFUND_GROUP_ID,
        `⚠️ *PEMBAYARAN MASUK — PHONE TIDAK DITEMUKAN*\n\n` +
        `Order ID : ${order_id}\n` +
        `Total    : ${formatRupiah(gross_amount)}\n` +
        `Waktu    : ${formatWaktuWIB(transaction_time)}\n\n` +
        `Cek manual.`
      );
    }
  }

  return { statusCode: 200, body: "OK" };
};