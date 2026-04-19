/**
 * moka-callback.js
 * Netlify Function — Menerima webhook status order dari Moka (Advanced Ordering)
 *
 * Dipasang sebagai callback URL saat submit order ke Moka:
 *   cancel_order_notification_url  → https://sectorseven.space/.netlify/functions/moka-callback
 *   accept_order_notification_url  → https://sectorseven.space/.netlify/functions/moka-callback
 *   complete_order_notification_url → https://sectorseven.space/.netlify/functions/moka-callback
 *
 * Flow per status:
 *   accepted  → kirim WA ke customer: pesanan dikonfirmasi, sedang dibuat
 *   rejected  → kirim WA ke customer: berisi template form refund via WA
 *   completed → kirim WA ke customer: pesanan selesai, silakan ambil
 */

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const REFUND_GROUP_ID = process.env.REFUND_GROUP_ID; // ID grup WA admin, contoh: 120363407944490567@g.us

// ─── Utility: Kirim WA via Fonnte ──────────────────────────────────────────────

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

// ─── Utility: Format Rupiah ────────────────────────────────────────────────────

function formatRupiah(amount) {
  if (!amount) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
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
    const store = getStore("pending-orders");
    pendingData = await store.get(application_order_id, { type: "json" });
  } catch (err) {
    console.warn(`[Blobs] Tidak bisa ambil data order ${application_order_id}: ${err.message}`);
  }

  const customerPhone = pendingData?.customerPhone || null;
  const customerName = pendingData?.customerName || "Kak";
  const grossAmount = pendingData?.grossAmount || null;
  const items = pendingData?.items || [];

  const itemList =
    items.length > 0
      ? items.map((i) => `  • ${i.name} x${i.qty}`).join("\n")
      : "";

  // ── Handle per status ─────────────────────────────────────────────────────────

  switch (status) {

    // ── ACCEPTED: Kasir terima order ────────────────────────────────────────────
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

    // ── COMPLETED: Kasir selesaikan order ───────────────────────────────────────
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

    // ── REJECTED: Kasir tolak order ─────────────────────────────────────────────
    case "rejected": {
      if (customerPhone) {
        const nominalText = grossAmount ? formatRupiah(grossAmount) : "[nominal]";

        const msg =
          `😔 *Pesananmu tidak bisa diproses*\n\n` +
          `Halo ${customerName}, mohon maaf pesananmu dengan ID *${application_order_id}* ` +
          `tidak bisa kami proses saat ini — kemungkinan bahan sedang habis.\n\n` +
          `Pembayaran sebesar *${nominalText}* akan kami kembalikan.\n\n` +
          `━━━━━━━━━━━━━━━━━\n` +
          `Untuk proses pengembalian dana, balas pesan ini dengan format berikut:\n\n` +
          `REFUND ${application_order_id}\n` +
          `Nama: \n` +
          `Metode: (GoPay / OVO / Dana / Transfer Bank)\n` +
          `Nomor: \n` +
          `Atas Nama: \n` +
          `━━━━━━━━━━━━━━━━━\n\n` +
          `Tim kami akan memproses dalam 1x24 jam 🙏\n\n` +
          `_Sector Seven Coffee_`;

        await sendWA(customerPhone, msg);
        console.log(`[moka-callback] WA refund form terkirim ke ${customerPhone}`);
      } else {
        // Jika nomor customer tidak ditemukan, langsung alert ke grup
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