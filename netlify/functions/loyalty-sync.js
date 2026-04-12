// netlify/functions/loyalty-sync.js
// Scheduled — poll Moka tiap 1 menit untuk offline transactions
// Source of truth: Google Sheets
//
// netlify.toml:
//   [[scheduled_functions]]
//     name = "loyalty-sync"
//     cron = "* * * * *"

const MOKA_BASE     = "https://api.mokapos.com";
const OUTLET_ID     = process.env.MOKA_OUTLET_ID;
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;
const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const REWARD_PREFIX = "REWARD_";

function calcPoints(amountIDR) {
  return Math.floor(Number(amountIDR) / 10000) * 10;
}

function normalizePhone(phone) {
  if (!phone) return null;
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

async function getMokaToken() {
  if (process.env.MOKA_ACCESS_TOKEN) return process.env.MOKA_ACCESS_TOKEN;
  const res  = await fetch(`${MOKA_BASE}/oauth/token`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", client_id: process.env.MOKA_CLIENT_ID, client_secret: process.env.MOKA_SECRET, refresh_token: process.env.MOKA_REFRESH_TOKEN }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh: ${res.status}`);
  return data.access_token;
}

async function fetchTransactions(token, sinceEpoch) {
  const url = `${MOKA_BASE}/v4/outlets/${OUTLET_ID}/reports/get_latest_transactions?since=${sinceEpoch}&per_page=50&reorder_type=ASC`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moka tx: ${res.status}`);
  return data?.data?.payments ?? [];
}

async function sheetsGet(params) {
  const url = new URL(SHEETS_URL);
  url.searchParams.set("secret", SHEETS_SECRET);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function sheetsPost(payload) {
  const res = await fetch(SHEETS_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
  });
  return res.json();
}

async function isProcessed(txId) {
  // Cek di Sheets History apakah txId sudah ada
  // Cara mudah: coba get_customer dengan txId sebagai marker — tidak ideal
  // Lebih baik: simpan processed txIds di sheet tersendiri atau cek History
  // Untuk simplicity, kita rely pada since epoch — transaksi lama tidak akan diambil lagi
  return false; // Handled by since epoch
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN || !phone) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method: "POST", headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) { console.error("[loyalty-sync] WA error:", e.message); }
}

// Simpan last_sync di Sheets meta atau gunakan Blobs hanya untuk ini
// Karena tidak ada Blobs, kita pakai file temporary di /tmp (tidak persisten antar invocation)
// Solusi: simpan di Sheets sheet "Meta"
async function getLastSync() {
  try {
    const data = await sheetsGet({ action: "get_meta", key: "last_sync" });
    return data?.value ? Number(data.value) : Date.now() - 7 * 24 * 60 * 60 * 1000; // default 7 hari lalu
  } catch {
    return Date.now() - 2 * 60 * 1000;
  }
}

async function setLastSync(epoch) {
  await sheetsPost({ action: "set_meta", key: "last_sync", value: String(epoch) }).catch(() => {});
}

export const handler = async () => {
  console.log("[loyalty-sync] Starting...");
  try {
    const sinceMs    = await getLastSync();
    const sinceEpoch = Math.floor(sinceMs / 1000);
    console.log(`[loyalty-sync] since=${new Date(sinceMs).toISOString()}`);

    // Update last_sync SEKARANG sebelum fetch — agar tidak fetch ulang transaksi sama
    await setLastSync(Date.now());

    const token = await getMokaToken();
    const txs   = await fetchTransactions(token, sinceEpoch);
    console.log(`[loyalty-sync] ${txs.length} transactions since ${new Date(sinceMs).toISOString()}`);
    txs.forEach(tx => console.log(`[loyalty-sync] tx=${tx.payment_no} type=${tx.payment_type} phone=${tx.customer_phone} total=${tx.total_collected}`));

    let earned = 0, redeemed = 0;

    for (const tx of txs) {
      const phone = normalizePhone(tx.customer_phone);
      if (!phone) continue;

      // Skip online orders — handled by order-notify.js
      if (tx.payment_type === "online_orders") continue;

      const name   = tx.customer_name || "";
      const amount = Number(tx.total_collected) || 0;
      const txId   = tx.payment_no || tx.id;

      const rewardDiscount = (tx.payment_discounts || []).find(
        (d) => !d.is_deleted && d.discount_name?.startsWith(REWARD_PREFIX)
      );

      if (rewardDiscount) {
        // Redemption offline — potong poin
        const match     = rewardDiscount.discount_name.match(/REWARD_(\d+)PTS/);
        const ptsDeduct = match ? parseInt(match[1]) : 0;

        if (ptsDeduct > 0) {
          const result = await sheetsPost({
            action: "deduct_points",
            phone, points: ptsDeduct,
            note: `Reward redeem offline: ${rewardDiscount.discount_name}`,
            txId,
          });

          if (result?.ok) {
            await sendWA(phone,
              `Halo *${name || "Kamu"}*! 🎁\n` +
              `Reward kamu sudah digunakan di *Sector Seven*.\n` +
              `Poin berkurang: *${ptsDeduct} pts*\n` +
              `Sisa poin: *${result.newPoints} pts*`
            );
            redeemed++;
          }
        }
      } else if (tx.payment_refunds?.length > 0) {
        // Transaksi yang di-refund — pakai refund UUID agar idempotent
        for (const refund of tx.payment_refunds) {
          const refundUUID  = refund.uuid;
          const refundPhone = normalizePhone(refund.customer_phone) || phone;
          if (!refundUUID || !refundPhone) continue;

          // Skip kalau refund ini sudah diproses (cek via txId di History Sheets)
          // Kita rely pada deduct_points di Apps Script — kalau sudah ada txId sama, tidak akan double

          const refundAmt = Number(refund.refund_amount) || 0;
          const pts       = calcPoints(refundAmt);
          if (pts <= 0) continue;

          const result = await sheetsPost({
            action: "deduct_points",
            phone:  refundPhone,
            points: pts,
            note:   `Refund ${refund.refund_type}: ${txId} (-${pts} pts)`,
            txId:   refundUUID,
          });

          if (result?.ok) {
            await sendWA(refundPhone,
              `Halo! ⚠️

` +
              `Transaksi kamu di *Sector Seven* telah di-refund.
` +
              `Poin dikurangi: *${pts} pts*
` +
              `Sisa poin: *${result.newPoints} pts*`
            );
            // txId sudah tersimpan di History Sheets sebagai idempotency key
          }
        }
      } else if (amount > 0) {
        // Normal offline transaction — tambah poin
        const pts = calcPoints(amount);
        if (pts > 0) {
          const existing = await sheetsGet({ action: "get_customer", phone });
          const oldPoints = existing?.found ? existing.points : 0;
          const newPoints = oldPoints + pts;
          const custName  = name || existing?.name || "";

          await sheetsPost({ action: "upsert_customer", phone, name: custName, points: newPoints, addSpend: amount });
          await sheetsPost({ action: "add_history", phone, name: custName, type: "earn", points: pts, amount, source: "offline", txId, note: `${pts} pts dari offline order` });

          await sendWA(phone,
            `Halo *${custName || "Kamu"}*! ☕\n\n` +
            `Terima kasih sudah ke *Sector Seven*!\n` +
            `Kamu dapat *+${pts} poin*.\n` +
            `Total poin: *${newPoints} pts*\n\n` +
            `Cek & tukar poin: sectorseven.space/loyalty`
          );
          earned++;
        }
      }
    }

    console.log(`[loyalty-sync] Done. earned=${earned} redeemed=${redeemed}`);
    return { statusCode: 200, body: JSON.stringify({ ok: true, earned, redeemed }) };

  } catch (err) {
    console.error("[loyalty-sync] Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};