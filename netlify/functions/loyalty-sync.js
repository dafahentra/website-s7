// netlify/functions/loyalty-sync.js
// Scheduled — poll Moka tiap 5 menit
// - Transaksi baru dengan customer_phone → tambah poin + WA notif + sync Sheets
// - Diskon dengan prefix REWARD_XXX → potong poin (redemption offline)
//
// netlify.toml:
//   [[scheduled_functions]]
//     name = "loyalty-sync"
//     cron = "*/5 * * * *"

import { getStore } from "@netlify/blobs";

const MOKA_BASE    = "https://api.mokapos.com";
const OUTLET_ID    = process.env.MOKA_OUTLET_ID;
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const SHEETS_URL   = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const REWARD_PREFIX = "REWARD_";

// Rp10.000 = 10 poin
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
  if (!res.ok) throw new Error(`Token refresh: ${res.status}`);
  return data.access_token;
}

async function fetchTransactions(token, sinceEpoch) {
  const url = `${MOKA_BASE}/v4/outlets/${OUTLET_ID}/reports/get_latest_transactions` +
    `?since=${sinceEpoch}&per_page=50&reorder_type=ASC`;
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moka tx: ${res.status}`);
  return data?.data?.payments ?? [];
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN || !phone) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) { console.error("[loyalty-sync] WA error:", e.message); }
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) return;
  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
    });
  } catch (e) { console.error("[loyalty-sync] Sheets error:", e.message); }
}

export const handler = async (event) => {
  console.log("[loyalty-sync] Starting...");
  try {
    const metaStore = getStore("loyalty-meta");
    const custStore = getStore("loyalty-customers");
    const procStore = getStore("loyalty-processed");

    const lastRaw    = await metaStore.get("last_sync").catch(() => null);
    const sinceMs    = lastRaw ? JSON.parse(lastRaw).epoch : Date.now() - 6 * 60 * 1000;
    const sinceEpoch = Math.floor(sinceMs / 1000);

    const token = await getMokaToken();
    const txs   = await fetchTransactions(token, sinceEpoch);
    console.log(`[loyalty-sync] ${txs.length} transactions since ${new Date(sinceMs).toISOString()}`);

    let earned = 0, redeemed = 0;

    for (const tx of txs) {
      const txId = tx.payment_no || tx.id;
      const phone = normalizePhone(tx.customer_phone);
      if (!phone) continue;

      const already = await procStore.get(`tx:${txId}`).catch(() => null);
      if (already) continue;

      const name   = tx.customer_name || "";
      const amount = Number(tx.total_collected) || 0;
      const now    = new Date().toISOString();

      // Load or create customer
      const raw      = await custStore.get(phone).catch(() => null);
      const customer = raw ? JSON.parse(raw) : { phone, name, points: 0, history: [], createdAt: now };
      if (name) customer.name = name; // Selalu update ke nama terbaru

      // Detect reward redemption via REWARD_ prefix discount
      const rewardDiscount = (tx.payment_discounts || []).find(
        (d) => !d.is_deleted && d.discount_name?.startsWith(REWARD_PREFIX)
      );

      if (rewardDiscount) {
        // Potong poin
        const match     = rewardDiscount.discount_name.match(/REWARD_(\d+)PTS/);
        const ptsDeduct = match ? parseInt(match[1]) : 0;
        if (ptsDeduct > 0) {
          customer.points = Math.max(0, customer.points - ptsDeduct);
          customer.history.unshift({ type: "redeem", points: -ptsDeduct, txId, createdAt: now, note: `Reward redeem offline: ${rewardDiscount.discount_name}` });

          await sendWA(phone,
            `Halo *${name || "Kamu"}*! 🎁\n\n` +
            `Reward kamu sudah digunakan di *Sector Seven*.\n` +
            `Poin berkurang: *${ptsDeduct} pts*\n` +
            `Sisa poin: *${customer.points} pts*`
          );

          sheetsPost({ action: "add_history", phone, name: customer.name, type: "redeem", points: -ptsDeduct, amount, source: "offline", txId, note: rewardDiscount.discount_name });
          redeemed++;
        }
      } else {
        // Tambah poin
        const pts = calcPoints(amount);
        if (pts > 0) {
          customer.points += pts;
          customer.history.unshift({ type: "earn", points: pts, amountIDR: amount, source: "offline", txId, createdAt: now, note: `+${pts} pts dari offline order` });

          await sendWA(phone,
            `Halo *${name || "Kamu"}*! ☕\n\n` +
            `Terima kasih sudah ke *Sector Seven*!\n` +
            `Kamu dapat *+${pts} poin*.\n` +
            `Total poin: *${customer.points} pts*\n\n` +
            `Cek & tukar poin: sectorseven.space/loyalty`
          );

          sheetsPost({ action: "add_history", phone, name: customer.name, type: "earn", points: pts, amount, source: "offline", txId, note: `Rp${amount}` });
          earned++;
        }
      }

      // Save customer + sync Sheets
      if (customer.history.length > 100) customer.history = customer.history.slice(0, 100);
      await custStore.set(phone, JSON.stringify(customer));
      sheetsPost({ action: "upsert_customer", phone, name: customer.name, points: customer.points, addSpend: amount });
      await procStore.set(`tx:${txId}`, "1");
    }

    await metaStore.set("last_sync", JSON.stringify({ epoch: Date.now() }));
    console.log(`[loyalty-sync] Done. earned=${earned} redeemed=${redeemed}`);
    return { statusCode: 200, body: JSON.stringify({ ok: true, earned, redeemed }) };

  } catch (err) {
    console.error("[loyalty-sync] Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};