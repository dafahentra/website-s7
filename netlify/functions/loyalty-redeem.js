// netlify/functions/loyalty-redeem.js
// POST { phone, rewardId } → kurangi poin + kirim kode via WA
// Source of truth: Google Sheets

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;

const REWARDS = [
  { id: "discount_3k",  points: 50,  label: "Diskon Rp3.000",     mokaDiscountName: "REWARD_50PTS"  },
  { id: "free_regular", points: 80,  label: "Free Regular Drink", mokaDiscountName: "REWARD_80PTS"  },
  { id: "free_large",   points: 100, label: "Free Large Drink",   mokaDiscountName: "REWARD_100PTS" },
];

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) return null;
  const res  = await fetch(SHEETS_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
  });
  return res.json();
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) { console.error("[loyalty-redeem] WA error:", e.message); }
}

export const handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const { phone, rewardId } = JSON.parse(event.body || "{}");
    if (!phone || !rewardId) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone and rewardId required" }) };

    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid rewardId" }) };

    const normalized = normalizePhone(phone);

    // Kurangi poin di Sheets (Sheets yang validasi cukup atau tidak)
    const result = await sheetsPost({
      action:      "deduct_points",
      phone:       normalized,
      points:      reward.points,
      rewardLabel: reward.label,
      note:        `Redeem: ${reward.label} (${reward.mokaDiscountName})`,
    });

    if (!result?.ok) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: result?.error || "Gagal redeem" }) };
    }

    const newPoints = result.newPoints;

    // WA — kirim kode ke customer
    await sendWA(normalized,
      `Halo! 🎁\n\n` +
      `Reward kamu berhasil diklaim: *${reward.label}*\n\n` +
      `Tunjukkan pesan ini ke kasir:\n` +
      `*Kode reward: ${reward.mokaDiscountName}*\n\n` +
      `Poin digunakan: *${reward.points} pts*\n` +
      `Sisa poin: *${newPoints} pts*\n\n` +
      `_Berlaku untuk kunjungan hari ini_`
    );

    return {
      statusCode: 200, headers: cors,
      body: JSON.stringify({
        ok:               true,
        reward:           reward.label,
        mokaDiscountName: reward.mokaDiscountName,
        pointsUsed:       reward.points,
        pointsLeft:       newPoints,
        instruction:      `Tunjukkan kode *${reward.mokaDiscountName}* ke kasir saat transaksi`,
      }),
    };

  } catch (err) {
    console.error("[loyalty-redeem] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};