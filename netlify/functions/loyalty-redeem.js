// netlify/functions/loyalty-redeem.js
// POST { phone, rewardId, agreedTerms } → kurangi poin + kirim kode via WA + ntfy admin
// Source of truth: Google Sheets

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;

// ─── 4-tier reward catalog ───────────────────────────────────────────────────
// PENTING: discount dengan nama yang sama (REWARD_xxxPTS) WAJIB dibuat manual
// di Moka Dashboard agar kasir bisa apply saat customer redeem.
const REWARDS = [
  {
    id:               "tier_130",
    points:           130,
    label:            "Free Regular Drink",
    description:      "Klaim 1 minuman regular size (coffee atau matcha based)",
    mokaDiscountName: "REWARD_130PTS",
  },
  {
    id:               "tier_170",
    points:           170,
    label:            "Free Large Drink",
    description:      "Klaim 1 minuman large size (coffee atau matcha based)",
    mokaDiscountName: "REWARD_170PTS",
  },
  {
    id:               "tier_200",
    points:           200,
    label:            "Coffee Combo",
    description:      "1 regular + 1 large coffee, ATAU 1 regular coffee + pastry/sourdough",
    mokaDiscountName: "REWARD_200PTS",
  },
  {
    id:               "tier_240",
    points:           240,
    label:            "Matcha Combo",
    description:      "1 regular + 1 large matcha, ATAU 1 regular matcha + pastry/sourdough",
    mokaDiscountName: "REWARD_240PTS",
  },
];

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

function maskPhone(phone) {
  const s = String(phone || "");
  return s ? `***${s.slice(-3)}` : "";
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) return null;
  const res = await fetch(SHEETS_URL, {
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
  } catch (e) {
    console.error("[loyalty-redeem] WA error:", e.message);
  }
}

// ─── ntfy inline (priority 3 = info, untuk audit trail) ────────────────────
async function ntfyInfo(title, message, tags = "gift") {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method:  "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Title":        String(title).slice(0, 250),
        "Priority":     "3",
        "Tags":         tags,
      },
      body: String(message).slice(0, 4096),
    });
  } catch (e) {
    console.error("[loyalty-redeem][ntfy]", e.message);
  }
}

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const { phone, rewardId, agreedTerms } = JSON.parse(event.body || "{}");

    if (!phone || !rewardId) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: "phone and rewardId required" }),
      };
    }

    // Server-side guard: pastikan customer benar-benar setuju S&K
    // Frontend kirim agreedTerms=true setelah popup konfirmasi
    if (!agreedTerms) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: "Persetujuan S&K diperlukan untuk menukar poin" }),
      };
    }

    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: "Invalid rewardId" }),
      };
    }

    const normalized = normalizePhone(phone);

    // ── Kurangi poin di Sheets ──────────────────────────────────────────
    // Apps Script di Sheets validasi: poin cukup atau tidak
    const result = await sheetsPost({
      action:      "deduct_points",
      phone:       normalized,
      points:      reward.points,
      rewardLabel: reward.label,
      note:        `Redeem: ${reward.label} (${reward.mokaDiscountName})`,
    });

    if (!result?.ok) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: result?.error || "Gagal redeem" }),
      };
    }

    const newPoints    = result.newPoints;
    const customerName = result.name || "Customer";

    // ── WA → kirim kode ke customer ─────────────────────────────────────
    await sendWA(normalized,
      `Halo *${customerName}*! 🎁\n\n` +
      `Reward kamu berhasil diklaim: *${reward.label}*\n` +
      `${reward.description}\n\n` +
      `Tunjukkan pesan ini ke kasir:\n` +
      `*Kode reward: ${reward.mokaDiscountName}*\n\n` +
      `Poin digunakan: *${reward.points} pts*\n` +
      `Sisa poin: *${newPoints} pts*\n\n` +
      `_Wajib di-redeem hari ini di Sector Seven_\n` +
      `_Tidak dapat digabung dengan promo/diskon lain_`
    );

    // ── ntfy → notify admin (audit trail) ──────────────────────────────
    // Fire-and-forget: tidak block response ke customer
    ntfyInfo(
      `🎁 Reward Redeemed: ${reward.label}`,
      [
        `Customer: ${customerName} (${maskPhone(normalized)})`,
        `Tier: ${reward.points} pts → ${reward.label}`,
        `Kode: ${reward.mokaDiscountName}`,
        `Sisa poin: ${newPoints} pts`,
        "",
        "Kasir akan dihubungi customer untuk apply discount.",
      ].join("\n"),
      "gift"
    );

    return {
      statusCode: 200, headers: cors,
      body: JSON.stringify({
        ok:               true,
        reward:           reward.label,
        description:      reward.description,
        mokaDiscountName: reward.mokaDiscountName,
        pointsUsed:       reward.points,
        pointsLeft:       newPoints,
        instruction:      `Tunjukkan kode *${reward.mokaDiscountName}* ke kasir saat transaksi`,
      }),
    };

  } catch (err) {
    console.error("[loyalty-redeem] Error:", err.message);
    return {
      statusCode: 500, headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};