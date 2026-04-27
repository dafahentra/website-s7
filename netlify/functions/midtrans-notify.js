/**
 * midtrans-notify.js
 * Webhook handler notifikasi pembayaran dari Midtrans.
 *
 * NEW ARCH: Ini SATU-SATUNYA path yang submit paid order ke Moka.
 * Frontend hanya simpan ke Blobs, tidak submit ke Moka langsung.
 *
 * Flow:
 *   1. Terima webhook → validasi signature
 *   2. Cek settlement / capture+accept
 *   3. Baca orderData dari Blobs
 *   4. Submit ke Moka via moka-checkout
 *   5. Kalau gagal → auto-refund + alert
 *   6. Update Blobs: grossAmount + mokaStatus
 *   7. Notif grup + ntfy tablet + WA receipt
 */

import crypto from "crypto";
import { getStore } from "@netlify/blobs";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const FONNTE_TOKEN        = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID     = process.env.REFUND_GROUP_ID;
const NETLIFY_SITE_ID     = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN   = process.env.NETLIFY_API_TOKEN;
const SITE_URL            = process.env.URL || "https://sectorseven.space";

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  return getStore(name);
}

function validateSignature(orderId, statusCode, grossAmount, signatureKey) {
  return crypto.createHash("sha512").update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY).digest("hex") === signatureKey;
}

function formatWaktuWIB(dateStr) {
  const date = dateStr ? new Date(dateStr.replace(" ", "T") + "+07:00") : new Date();
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }) + " WIB";
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function stripEmoji(str) {
  return String(str).replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u200D\uFE0F]/gu, "").trim();
}

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });
    const result = await res.json();
    console.log(`[sendWA] → ${target} | status: ${result?.status}`);
    return result;
  } catch (err) { console.error("[sendWA] Error:", err.message); return null; }
}

async function ntfyAlert(title, message, tags = "rotating_light", click = "") {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      "Title":        stripEmoji(title).slice(0, 250),
      "Priority":     "5",
      "Tags":         tags,
    };
    if (click) headers.Click = click;
    await fetch(`https://ntfy.sh/${topic}`, { method: "POST", headers, body: String(message).slice(0, 4096) });
  } catch (e) { console.error("[midtrans-notify][ntfyAlert]", e.message); }
}

async function submitOrderToMoka(orderData) {
  const res = await fetch(`${SITE_URL}/.netlify/functions/moka-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: orderData }),
  });
  const data = await res.json().catch(() => ({}));
  const errMsg = data?.error || "";
  if (!res.ok && errMsg.toLowerCase().includes("duplicate")) {
    console.log("[midtrans-notify] Duplicate di Moka — OK (idempotent)");
    return data;
  }
  if (!res.ok) throw new Error(errMsg || `moka-checkout error ${res.status}`);
  console.log("[midtrans-notify] Order masuk ke Moka");
  return data;
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  let notification;
  try { notification = JSON.parse(event.body); } catch { return { statusCode: 400, body: "Invalid JSON" }; }

  const { order_id, transaction_status, fraud_status, gross_amount, status_code, signature_key, transaction_time } = notification;
  console.log(`[midtrans-notify] ${order_id} — status: ${transaction_status}`);

  if (!validateSignature(order_id, status_code, gross_amount, signature_key)) {
    console.error("[midtrans-notify] Signature tidak valid!");
    return { statusCode: 403, body: "Invalid signature" };
  }

  const isSettled = transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept");
  if (!isSettled) {
    console.log(`[midtrans-notify] Status ${transaction_status} — skip`);
    return { statusCode: 200, body: "OK" };
  }

  // ── Baca data dari Blobs ──────────────────────────────────────────────────
  let pendingData = null, customerPhone = null, customerName = "Pelanggan", orderItems = [], orderData = null;

  try {
    const store = getBlobsStore("pending-orders");
    pendingData = await store.get(order_id, { type: "json" });
    if (pendingData) {
      if (["submitted", "expired", "refunded"].includes(pendingData.mokaStatus)) {
        console.log(`[midtrans-notify] ${order_id} sudah diproses (${pendingData.mokaStatus}) — skip Moka`);
        orderData = null;
      } else {
        orderData = pendingData.orderData || null;
      }
      customerPhone = pendingData.customerPhone || null;
      customerName  = pendingData.customerName  || "Pelanggan";
      orderItems    = pendingData.items         || [];
      console.log(`[Blobs] phone=${customerPhone} orderData=${!!orderData} status=${pendingData.mokaStatus || "new"}`);
    } else {
      console.warn(`[Blobs] Tidak ada data untuk ${order_id}`);
    }
  } catch (err) { console.error(`[Blobs] Error: ${err.message}`); }

  // ── ALERT: pending data hilang ────────────────────────────────────────────
  if (!pendingData) {
    ntfyAlert(
      `Payment Settled WITHOUT Pending Data: ${order_id}`,
      `Order: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\nWaktu: ${formatWaktuWIB(transaction_time)}\n\nCustomer BAYAR tapi data order HILANG di Blobs!\nACTION: Cek Midtrans Dashboard → input manual / refund`,
      "rotating_light,money_with_wings",
      `https://dashboard.midtrans.com/beta/transactions?search=${order_id}`
    );
  }

  // ── Submit ke Moka ────────────────────────────────────────────────────────
  if (orderData) {
    try {
      const invalidItems = (orderData.order_items || []).filter((i) => !i.item_id);
      if (invalidItems.length > 0) throw new Error("item_id null: " + invalidItems.map((i) => i.item_name || "?").join(", "));

      await submitOrderToMoka(orderData);

      // Update Blobs
      if (pendingData) {
        try {
          const store = getBlobsStore("pending-orders");
          await store.setJSON(order_id, {
            ...pendingData, grossAmount: gross_amount,
            mokaSubmittedAt: new Date().toISOString(), mokaStatus: "submitted",
          });
        } catch (e) { console.error("[midtrans-notify] Blobs update gagal:", e.message); }
      }
    } catch (err) {
      console.error("[midtrans-notify] Moka submit gagal:", err.message);

      // ── Auto-refund ───────────────────────────────────────────────────
      let refundSuccess = false;
      try {
        const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
        const refundRes = await fetch(`https://api.midtrans.com/v2/${order_id}/refund`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Basic ${auth}` },
          body: JSON.stringify({ refund_key: `refund-${order_id}`, amount: Number(gross_amount), reason: "Pesanan gagal diproses — refund otomatis" }),
        });
        const refundData = await refundRes.json();
        const isDuplicate = refundData.status_code === "412" || (refundData.status_message || "").toLowerCase().includes("duplicate");
        if (isDuplicate || refundData.status_code === "200") { refundSuccess = true; console.log(`[midtrans-notify] Auto refund OK`); }
        else throw new Error(refundData.status_message || `status ${refundData.status_code}`);
      } catch (refundErr) { console.error("[midtrans-notify] Auto refund gagal:", refundErr.message); }

      ntfyAlert(
        refundSuccess ? `Moka Failed (Refunded): ${order_id}` : `Moka Failed + Refund FAILED: ${order_id}`,
        `Order: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\nError: ${err.message}\n${refundSuccess ? "Customer di-refund." : "REFUND GAGAL — manual via Midtrans!"}`,
        refundSuccess ? "warning,moka" : "rotating_light,money_with_wings",
        `https://dashboard.midtrans.com/beta/transactions?search=${order_id}`
      );

      if (REFUND_GROUP_ID) {
        await sendWA(REFUND_GROUP_ID,
          `⚠️ *MOKA SUBMIT GAGAL*\n\nOrder: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\nError: ${err.message}\n\n` +
          (refundSuccess ? `✅ Refund otomatis OK.` : `❌ Refund juga gagal. Manual via Midtrans.`));
      }

      if (customerPhone) {
        await sendWA(customerPhone, refundSuccess
          ? `😔 *Pesananmu tidak bisa diproses*\n\nHalo ${customerName}, terjadi kendala teknis.\n\n✅ *Refund ${formatRupiah(gross_amount)} sudah diproses.*\nDana kembali beberapa menit - 1 hari kerja.\n\n_Sector Seven Coffee_`
          : `😔 *Pesananmu tidak bisa diproses*\n\nHalo ${customerName}, terjadi kendala teknis.\n\nTim kami akan proses refund ${formatRupiah(gross_amount)} dalam 2 jam 🙏\n\n_Sector Seven Coffee_`);
      }
    }
  } else {
    console.warn(`[midtrans-notify] orderData null untuk ${order_id} — skip Moka submit`);
    // Tetap simpan grossAmount untuk moka-callback (refund/loyalty)
    if (pendingData && !pendingData.grossAmount) {
      try {
        const store = getBlobsStore("pending-orders");
        await store.setJSON(order_id, { ...pendingData, grossAmount: gross_amount });
        console.log(`[midtrans-notify] grossAmount ${gross_amount} saved`);
      } catch (e) { console.error("[midtrans-notify] grossAmount save gagal:", e.message); }
    }
  }

  // ── Notif grup + ntfy tablet ──────────────────────────────────────────────
  const itemListGrup = orderItems.length > 0 ? orderItems.map((i) => `  • ${i.name} x${i.qty}`).join("\n") : "-";
  const grupMsg = `🛎️ *ORDER ONLINE MASUK*\n\nOrder: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\nWaktu: ${formatWaktuWIB(transaction_time)}\nCustomer: ${customerName}\nHP: ${customerPhone || "-"}\n\nMenu:\n${itemListGrup}`;

  const notifTasks = [];
  if (REFUND_GROUP_ID) notifTasks.push(sendWA(REFUND_GROUP_ID, grupMsg));
  const NTFY_TOPIC = process.env.NTFY_TOPIC;
  if (NTFY_TOPIC) {
    notifTasks.push(
      fetch("https://ntfy.sh/" + NTFY_TOPIC, {
        method: "POST",
        headers: { "Title": stripEmoji("Order Masuk! " + formatRupiah(gross_amount)).slice(0, 250), "Priority": "urgent", "Tags": "bell", "Content-Type": "text/plain; charset=utf-8" },
        body: customerName + " - " + formatRupiah(gross_amount) + "\n" + itemListGrup,
      }).catch((e) => console.error("[ntfy] gagal:", e.message))
    );
  }
  await Promise.allSettled(notifTasks);

  // ── WA receipt ────────────────────────────────────────────────────────────
  if (customerPhone) {
    const itemList = orderItems.length > 0 ? orderItems.map((i) => `  • ${i.name} x${i.qty}`).join("\n") : "";
    await sendWA(customerPhone,
      `✅ *Pembayaran Berhasil!*\n\nOrder: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\nWaktu: ${formatWaktuWIB(transaction_time)}\n` +
      (itemList ? `\n*Pesanan:*\n${itemList}\n` : "") +
      `\nPesananmu sedang kami konfirmasi 🙏\nKami kabarin segera!\n\n_Sector Seven Coffee_ ☕`);
    console.log(`[WA] Receipt → ${customerPhone}`);
  } else {
    console.warn(`[WA] customerPhone null untuk ${order_id}`);
    if (REFUND_GROUP_ID) {
      await sendWA(REFUND_GROUP_ID, `⚠️ *PAYMENT MASUK — PHONE NULL*\n\nOrder: ${order_id}\nTotal: ${formatRupiah(gross_amount)}\n\nCek manual.`);
    }
  }

  return { statusCode: 200, body: "OK" };
};