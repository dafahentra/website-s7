// netlify/functions/loyalty-redeem.js
// POST { phone, rewardId } → kurangi poin + return kode diskon Moka
// Kode diskon = nama diskon di Moka yang kasir apply (prefix REWARD_)
//
// Setup di Moka Backoffice → Library → Diskon:
//   - Nama: REWARD_50PTS  | Tipe: Nominal | Rp3.000
//   - Nama: REWARD_80PTS  | Tipe: Nominal | Rp25.000 (atau free item)
//   - Nama: REWARD_100PTS | Tipe: Nominal | Rp30.000

import { getStore } from "@netlify/blobs";

const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;
const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";

const REWARDS = [
  { id: "discount_3k",  points: 50,  label: "Diskon Rp3.000",      mokaDiscountName: "REWARD_50PTS" },
  { id: "free_regular", points: 80,  label: "Free Regular Drink",  mokaDiscountName: "REWARD_80PTS" },
  { id: "free_large",   points: 100, label: "Free Large Drink",    mokaDiscountName: "REWARD_100PTS" },
];

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) { console.error("[loyalty-redeem] WA error:", e.message); }
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) return;
  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
    });
  } catch (e) { console.error("[loyalty-redeem] Sheets error:", e.message); }
}

export const handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const { phone, rewardId } = JSON.parse(event.body || "{}");
    if (!phone || !rewardId) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone and rewardId required" }) };

    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid rewardId" }) };

    const normalized = normalizePhone(phone);
    const store      = getStore("loyalty-customers");
    const raw        = await store.get(normalized).catch(() => null);
    if (!raw) return { statusCode: 404, headers: cors, body: JSON.stringify({ error: "Customer tidak ditemukan" }) };

    const customer = JSON.parse(raw);
    if (customer.points < reward.points) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: `Poin tidak cukup. Butuh ${reward.points}, kamu punya ${customer.points}` }) };
    }

    // Kurangi poin
    customer.points -= reward.points;
    const now = new Date().toISOString();
    customer.history.unshift({
      type: "redeem", points: -reward.points, rewardId,
      note: `Redeem: ${reward.label} (${reward.mokaDiscountName})`, createdAt: now,
    });
    if (customer.history.length > 100) customer.history = customer.history.slice(0, 100);
    await store.set(normalized, JSON.stringify(customer));

    // WA — kirim nama diskon Moka yang harus dipakai kasir
    await sendWA(normalized,
      `Halo *${customer.name || "Kamu"}*! 🎁\n\n` +
      `Reward kamu berhasil diklaim: *${reward.label}*\n\n` +
      `Tunjukkan pesan ini ke kasir:\n` +
      `*Kode reward: ${reward.mokaDiscountName}*\n\n` +
      `Poin digunakan: *${reward.points} pts*\n` +
      `Sisa poin: *${customer.points} pts*\n\n` +
      `_Berlaku untuk kunjungan hari ini_`
    );

    // Sync Sheets
    sheetsPost({ action: "upsert_customer", phone: normalized, name: customer.name, points: customer.points, addSpend: 0 });
    sheetsPost({ action: "add_history", phone: normalized, name: customer.name, type: "redeem", points: -reward.points, amount: 0, source: "website", note: reward.label });

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        ok:                true,
        reward:            reward.label,
        mokaDiscountName:  reward.mokaDiscountName,
        pointsUsed:        reward.points,
        pointsLeft:        customer.points,
        // Instruksi untuk customer
        instruction:       `Tunjukkan kode *${reward.mokaDiscountName}* ke kasir saat transaksi`,
      }),
    };

  } catch (err) {
    console.error("[loyalty-redeem] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};