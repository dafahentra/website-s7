/**
 * moka-callback.js
 * Netlify Function — Menerima webhook status order dari Moka (Advanced Ordering)
 *
 * Dipasang sebagai callback URL saat submit order ke Moka:
 *   cancel_order_notification_url   → https://sectorseven.space/.netlify/functions/moka-callback
 *   accept_order_notification_url   → https://sectorseven.space/.netlify/functions/moka-callback
 *   complete_order_notification_url → https://sectorseven.space/.netlify/functions/moka-callback
 *
 * Flow per status:
 *   accepted  → kirim WA ke customer: pesanan dikonfirmasi, sedang dibuat
 *   rejected  → kirim WA ke customer: detail order + template form refund lengkap
 *   completed → kirim WA ke customer: pesanan selesai, silakan ambil
 *
 * ENV yang dibutuhkan:
 *   FONNTE_TOKEN
 *   REFUND_GROUP_ID   — ID grup WA TEST, cth: 120363xxxxxx@g.us
 *   NETLIFY_SITE_ID
 *   NETLIFY_API_TOKEN
 */

import { getStore } from "@netlify/blobs";

const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const FONNTE_TOKEN      = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID   = process.env.REFUND_GROUP_ID;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getBlobsStore(name) {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name, siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore(name);
}

async function sendWA(target, message) {
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, message, countryCode: "62" }),
    });
    const result = await res.json();
    console.log(`[sendWA] → ${target}: ${result?.status}`);
    return result;
  } catch (err) {
    console.error(`[sendWA] Error: ${err.message}`);
    return null;
  }
}

function formatRupiah(amount) {
  if (!amount) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTimestamp(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";
  } catch {
    return null;
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { application_order_id, status, outlet_id } = body;

  console.log(`[moka-callback] Order: ${application_order_id} | Status: ${status} | Outlet: ${outlet_id}`);

  if (!application_order_id || !status) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  // ── Ambil data order dari Netlify Blobs ───────────────────────────────────────
  let pendingData = null;
  try {
    const store = getBlobsStore("pending-orders");
    pendingData = await store.get(application_order_id, { type: "json" });
  } catch (err) {
    console.warn(`[Blobs] Tidak bisa ambil data order ${application_order_id}: ${err.message}`);
  }

  const customerPhone = pendingData?.customerPhone || null;
  const customerName  = pendingData?.customerName  || "Kak";
  const grossAmount   = pendingData?.grossAmount   || null;
  const items         = pendingData?.items         || [];
  const orderTimestamp = pendingData?.orderTimestamp || null;

  const itemList = items.length > 0
    ? items.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
    : "";

  // ── Handle per status ─────────────────────────────────────────────────────────

  switch (status) {

    // ── ACCEPTED ────────────────────────────────────────────────────────────────
    case "accepted": {
      if (customerPhone) {
        const msg =
          `☕ *Pesananmu dikonfirmasi!*\n\n` +
          `Halo ${customerName}, pesananmu sedang kami buat sekarang.\n` +
          (itemList ? `\n*Pesanan:*\n${itemList}\n` : "") +
          `\nSilakan tunggu sebentar ya 🙏\n\n` +
          `_Sector Seven Coffee_`;

        await sendWA(customerPhone, msg);
        console.log(`[moka-callback] WA accepted terkirim ke ${customerPhone}`);
      }
      break;
    }

    // ── COMPLETED ───────────────────────────────────────────────────────────────
    case "completed": {
      if (customerPhone) {
        const msg =
          `✅ *Pesananmu sudah siap!*\n\n` +
          `Halo ${customerName}, pesananmu sudah selesai dibuat.\n` +
          (itemList ? `\n*Pesanan:*\n${itemList}\n` : "") +
          `\nSilakan diambil di counter ya! 😊\n\n` +
          `_Sector Seven Coffee_`;

        await sendWA(customerPhone, msg);
        console.log(`[moka-callback] WA completed terkirim ke ${customerPhone}`);
      }
      break;
    }

    // ── REJECTED ────────────────────────────────────────────────────────────────
    case "rejected": {
      if (customerPhone) {
        const nominalText   = formatRupiah(grossAmount);
        const timestampText = formatTimestamp(orderTimestamp) || "—";
        const menuText      = itemList || "—";

        // ── Bubble 1: Info pesanan ditolak ──────────────────────────────────────
        const msg1 =
          `😔 *Pesananmu tidak bisa diproses*\n\n` +
          `Halo ${customerName}, pesananmu tidak bisa kami proses saat ini — kemungkinan bahan sedang habis.\n\n` +
          `🔖 Order ID: *${application_order_id}*\n` +
          `🕐 Waktu: ${timestampText}\n` +
          `☕ Menu:\n${menuText}\n` +
          `💰 Nominal: *${nominalText}*\n\n` +
          `Refund akan kami proses dalam *2 jam*.\n` +
          `Silakan kirim data refund kamu di pesan berikutnya 👇\n\n` +
          `_Sector Seven Coffee_`;

        await sendWA(customerPhone, msg1);

        // ── Bubble 2: Template form refund ──────────────────────────────────────
        const msg2 =
          `💸 *Form Refund*\n\n` +
          `Salin dan isi format berikut, lalu kirim balik ke sini:\n\n` +
          `REFUND ${application_order_id}\n` +
          `Nama: [nama lengkap]\n` +
          `No HP: [nomor HP kamu]\n` +
          `Metode: [GoPay / OVO / Dana / BCA / BRI / dll]\n` +
          `No Rekening: [nomor rekening atau e-wallet]\n` +
          `Atas Nama: [nama di rekening / e-wallet]`;

        await sendWA(customerPhone, msg2);
        console.log(`[moka-callback] WA refund 2 bubble terkirim ke ${customerPhone}`);

      } else {
        // Tidak ada nomor customer — alert langsung ke grup TEST
        console.warn(`[moka-callback] customerPhone tidak ada untuk ${application_order_id}`);
        if (REFUND_GROUP_ID) {
          await sendWA(
            REFUND_GROUP_ID,
            `⚠️ *ORDER REJECTED — NO CUSTOMER PHONE*\n\n` +
            `Order ID : ${application_order_id}\n` +
            `Total    : ${formatRupiah(grossAmount)}\n\n` +
            `Customer tidak bisa dihubungi via WA. Proses manual.`
          );
        }
      }
      break;
    }

    default:
      console.log(`[moka-callback] Status tidak dihandle: ${status}`);
  }

  return { statusCode: 200, body: "OK" };
};