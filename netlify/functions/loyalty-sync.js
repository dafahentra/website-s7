// netlify/functions/loyalty-sync.js
// Scheduled — poll Moka tiap 1 menit untuk offline transactions
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
  if (!res.ok) throw new Error(`Sheets GET failed: ${res.status}`);
  return res.json();
}

async function sheetsPost(payload) {
  const res = await fetch(SHEETS_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
  });
  return res.json();
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN || !phone) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) {
    console.error("[loyalty-sync] WA error:", e.message);
  }
}

async function getLastSync() {
  try {
    const data  = await sheetsGet({ action: "get_meta", key: "last_sync" });
    const value = Number(data?.value);
    return value && !isNaN(value) && value > 0
      ? value
      : Date.now() - 7 * 24 * 60 * 60 * 1000;
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

    // Update last_sync sebelum fetch — hindari double-process transaksi
    await setLastSync(Date.now());

    const token = await getMokaToken();
    const txs   = await fetchTransactions(token, sinceEpoch);
    console.log(`[loyalty-sync] ${txs.length} transactions since ${new Date(sinceMs).toISOString()}`);

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
        const match     = rewardDiscount.discount_name.match(/REWARD_(\d+)PTS/);
        const ptsDeduct = match ? parseInt(match[1]) : 0;

        if (ptsDeduct > 0) {
          const result = await sheetsPost({
            action: "deduct_points",
            phone,
            points: ptsDeduct,
            note:   `Reward redeem offline: ${rewardDiscount.discount_name}`,
            txId,
          });

          if (result?.ok) {
            await sendWA(
              phone,
              `Halo *${name || "Kamu"}*! 🎁\n` +
              `Reward kamu sudah digunakan di *Sector Seven*.\n` +
              `Poin berkurang: *${ptsDeduct} pts*\n` +
              `Sisa poin: *${result.newPoints} pts*`
            );
            redeemed++;
          }
        }
      } else if (tx.payment_refunds?.length > 0) {
        for (const refund of tx.payment_refunds) {
          const refundUUID  = refund.uuid;
          const refundPhone = normalizePhone(refund.customer_phone) || phone;
          if (!refundUUID || !refundPhone) continue;

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
            await sendWA(
              refundPhone,
              `Halo! ⚠️\n` +
              `Transaksi kamu di *Sector Seven* telah di-refund.\n` +
              `Poin dikurangi: *${pts} pts*\n` +
              `Sisa poin: *${result.newPoints} pts*`
            );
          }
        }
      } else if (amount > 0) {
        const pts = calcPoints(amount);
        if (pts > 0) {
          const result = await sheetsPost({
            action:    "increment_points",
            phone, name, points: pts, addSpend: amount,
            source:    "offline",
            txId,
            note:      `${pts} pts dari offline order`,
          });

          if (result?.ok && !result?.skipped) {
            await sendWA(
              phone,
              `Halo *${name || "Kamu"}*!\n\n` +
              `Terima kasih sudah ke *Sector Seven*!\n` +
              `Kamu dapat *+${pts} poin*.\n` +
              `Total poin: *${result.newPoints} pts*\n\n` +
              `Cek & tukar poin: www.sectorseven.space/loyalty/`
            );
            earned++;
          }
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