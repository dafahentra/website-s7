// netlify/functions/loyalty-sync.js
// Scheduled — poll Moka tiap 1 menit untuk offline transactions
//
// netlify.toml (WAJIB ADA):
//   [[scheduled_functions]]
//     name = "loyalty-sync"
//     cron = "* * * * *"

const MOKA_BASE     = "https://api.mokapos.com";
const OUTLET_ID     = process.env.MOKA_OUTLET_ID;
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;
const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const REWARD_PREFIX = "REWARD_";

// Buffer 5 menit: Moka butuh waktu untuk mengindex transaksi offline ke reporting API.
// Dengan buffer ini, setiap run selalu "overlap" 5 menit ke belakang.
// Idempotency di Apps Script (cek txId) yang mencegah double-processing.
const SYNC_BUFFER_MS = 5 * 60 * 1000;

function calcPoints(amountIDR) {
  return Math.floor(Number(amountIDR) / 10000) * 10;
}

function normalizePhone(phone) {
  if (!phone) return null;
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

function validateEnv() {
  const missing = [];
  if (!OUTLET_ID)  missing.push("MOKA_OUTLET_ID");
  if (!SHEETS_URL) missing.push("LOYALTY_SHEETS_URL");
  if (!process.env.MOKA_ACCESS_TOKEN && !process.env.MOKA_REFRESH_TOKEN)
    missing.push("MOKA_ACCESS_TOKEN atau MOKA_REFRESH_TOKEN");
  if (missing.length > 0)
    console.warn(`[loyalty-sync] ⚠️ Env vars tidak ditemukan: ${missing.join(", ")}`);
  return missing.length === 0;
}

async function getMokaToken() {
  if (process.env.MOKA_ACCESS_TOKEN) {
    console.log("[loyalty-sync] Menggunakan MOKA_ACCESS_TOKEN dari env");
    return process.env.MOKA_ACCESS_TOKEN;
  }
  console.log("[loyalty-sync] Mencoba refresh token...");
  const res  = await fetch(`${MOKA_BASE}/oauth/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh gagal: ${res.status} — ${JSON.stringify(data)}`);
  console.log("[loyalty-sync] Token berhasil di-refresh");
  return data.access_token;
}

async function fetchTransactions(token, sinceEpoch) {
  const url = `${MOKA_BASE}/v4/outlets/${OUTLET_ID}/reports/get_latest_transactions?since=${sinceEpoch}&per_page=50&reorder_type=ASC`;
  console.log(`[loyalty-sync] Fetch: ${url}`);
  const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(`Moka API error ${res.status}: ${JSON.stringify(data)}`);
  const txs = data?.data?.payments ?? [];
  console.log(`[loyalty-sync] Moka mengembalikan ${txs.length} transaksi`);
  return txs;
}

async function sheetsGet(params) {
  if (!SHEETS_URL) throw new Error("LOYALTY_SHEETS_URL tidak di-set");
  const url = new URL(SHEETS_URL);
  url.searchParams.set("secret", SHEETS_SECRET);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sheets GET gagal: ${res.status}`);
  return res.json();
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) throw new Error("LOYALTY_SHEETS_URL tidak di-set");
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
    if (value && !isNaN(value) && value > 0) {
      console.log(`[loyalty-sync] last_sync dari Sheets: ${new Date(value).toISOString()}`);
      return value;
    }
    const defaultMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    console.log(`[loyalty-sync] last_sync tidak ada — default 7 hari lalu`);
    return defaultMs;
  } catch (err) {
    console.warn(`[loyalty-sync] Gagal baca last_sync: ${err.message} — fallback 10 menit lalu`);
    return Date.now() - 10 * 60 * 1000;
  }
}

async function setLastSync(epoch) {
  await sheetsPost({ action: "set_meta", key: "last_sync", value: String(epoch) })
    .catch((err) => console.warn(`[loyalty-sync] Gagal simpan last_sync: ${err.message}`));
}

export const handler = async () => {
  console.log("[loyalty-sync] ====== START ======");
  console.log(`[loyalty-sync] Waktu: ${new Date().toISOString()}`);
  validateEnv();

  try {
    const sinceMs    = await getLastSync();
    const sinceEpoch = Math.floor(sinceMs / 1000);
    console.log(`[loyalty-sync] Fetch since: ${new Date(sinceMs).toISOString()} (epoch: ${sinceEpoch})`);

    // Simpan last_sync ke (sekarang - BUFFER) bukan ke sekarang.
    // Ini membuat setiap run overlap 5 menit ke belakang, sehingga transaksi
    // yang baru muncul di Moka API (ada delay indexing) tidak terlewat.
    // Apps Script mencegah double-processing via idempotency (cek txId).
    const newLastSync = Date.now() - SYNC_BUFFER_MS;
    await setLastSync(newLastSync);
    console.log(`[loyalty-sync] last_sync diset ke: ${new Date(newLastSync).toISOString()} (buffer ${SYNC_BUFFER_MS / 60000} menit)`);

    const token = await getMokaToken();
    const txs   = await fetchTransactions(token, sinceEpoch);

    if (txs.length === 0) {
      console.log("[loyalty-sync] Tidak ada transaksi baru.");
      return { statusCode: 200, body: JSON.stringify({ ok: true, earned: 0, redeemed: 0, skipped: 0 }) };
    }

    txs.forEach((tx, i) => {
      console.log(
        `[loyalty-sync] TX[${i}] id=${tx.payment_no} type=${tx.payment_type} ` +
        `phone="${tx.customer_phone || "-"}" total=${tx.total_collected} ` +
        `refunds=${tx.payment_refunds?.length ?? 0} discounts=${tx.payment_discounts?.length ?? 0}`
      );
    });

    let earned = 0, redeemed = 0, skipped = 0;

    for (const tx of txs) {
      const phone = normalizePhone(tx.customer_phone);
      const txId  = tx.payment_no || tx.id;

      if (!phone) {
        console.log(`[loyalty-sync] SKIP tx=${txId} — tidak ada nomor telepon`);
        skipped++; continue;
      }

      if (tx.payment_type === "online_orders") {
        console.log(`[loyalty-sync] SKIP tx=${txId} — online order`);
        skipped++; continue;
      }

      const name   = tx.customer_name || "";
      const amount = Number(tx.total_collected) || 0;

      const rewardDiscount = (tx.payment_discounts || []).find(
        (d) => !d.is_deleted && d.discount_name?.startsWith(REWARD_PREFIX)
      );

      // ── Case A: Redemption reward offline ──────────────────────────────────
      if (rewardDiscount) {
        console.log(`[loyalty-sync] tx=${txId} — redemption: ${rewardDiscount.discount_name}`);
        const match     = rewardDiscount.discount_name.match(/REWARD_(\d+)PTS/);
        const ptsDeduct = match ? parseInt(match[1]) : 0;
        if (ptsDeduct <= 0) { skipped++; continue; }

        const result = await sheetsPost({
          action: "deduct_points",
          phone, points: ptsDeduct,
          note:   `Reward redeem offline: ${rewardDiscount.discount_name}`,
          txId,
        });
        console.log(`[loyalty-sync] deduct result: ${JSON.stringify(result)}`);

        if (result?.ok) {
          await sendWA(phone,
            `Halo *${name || "Kamu"}*! 🎁\n` +
            `Reward kamu sudah digunakan di *Sector Seven*.\n` +
            `Poin berkurang: *${ptsDeduct} pts*\n` +
            `Sisa poin: *${result.newPoints} pts*`
          );
          redeemed++;
        }

      // ── Case B: Refund ──────────────────────────────────────────────────────
      } else if (tx.payment_refunds?.length > 0) {
        console.log(`[loyalty-sync] tx=${txId} — ${tx.payment_refunds.length} refund`);
        for (const refund of tx.payment_refunds) {
          const refundUUID  = refund.uuid;
          const refundPhone = normalizePhone(refund.customer_phone) || phone;
          if (!refundUUID || !refundPhone) continue;
          const pts = calcPoints(Number(refund.refund_amount) || 0);
          if (pts <= 0) continue;

          const result = await sheetsPost({
            action: "deduct_points",
            phone:  refundPhone, points: pts,
            note:   `Refund ${refund.refund_type}: ${txId} (-${pts} pts)`,
            txId:   refundUUID,
          });
          console.log(`[loyalty-sync] refund result: ${JSON.stringify(result)}`);

          if (result?.ok) {
            await sendWA(refundPhone,
              `Halo! ⚠️\n` +
              `Transaksi kamu di *Sector Seven* telah di-refund.\n` +
              `Poin dikurangi: *${pts} pts*\n` +
              `Sisa poin: *${result.newPoints} pts*`
            );
          }
        }

      // ── Case C: Normal earn ─────────────────────────────────────────────────
      } else if (amount > 0) {
        const pts = calcPoints(amount);
        console.log(`[loyalty-sync] tx=${txId} — earn: amount=${amount} → ${pts} pts untuk ${phone}`);

        if (pts <= 0) {
          console.log(`[loyalty-sync] SKIP tx=${txId} — 0 pts (amount < Rp10.000)`);
          skipped++; continue;
        }

        const result = await sheetsPost({
          action: "increment_points",
          phone, name, points: pts, addSpend: amount,
          source: "offline", txId,
          note:   `${pts} pts dari offline order`,
        });
        console.log(`[loyalty-sync] increment result: ${JSON.stringify(result)}`);

        if (result?.ok && !result?.skipped) {
          await sendWA(phone,
            `Halo *${name || "Kamu"}*!\n\n` +
            `Terima kasih sudah ke *Sector Seven*!\n` +
            `Kamu dapat *+${pts} poin*.\n` +
            `Total poin: *${result.newPoints} pts*\n\n` +
            `Cek & tukar poin: www.sectorseven.space/loyalty/`
          );
          earned++;
        } else if (result?.skipped) {
          console.log(`[loyalty-sync] SKIP tx=${txId} — sudah diproses (idempotent)`);
          skipped++;
        }

      } else {
        console.log(`[loyalty-sync] SKIP tx=${txId} — amount=${amount}`);
        skipped++;
      }
    }

    console.log(`[loyalty-sync] ====== SELESAI: earned=${earned} redeemed=${redeemed} skipped=${skipped} ======`);
    return { statusCode: 200, body: JSON.stringify({ ok: true, earned, redeemed, skipped }) };

  } catch (err) {
    console.error("[loyalty-sync] ❌ ERROR:", err.message);
    console.error("[loyalty-sync] Stack:", err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};