// netlify/functions/loyalty-add.js
// POST — tambah poin customer
// Pakai increment_points di Apps Script — tidak perlu GET dulu, lebih cepat

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;

// ─── Campaign Config ─────────────────────────────────────────────────────────
// Bonus poin untuk online order. Set endsAt ke null untuk matikan.
// Semua waktu dalam WIB (UTC+7).
const CAMPAIGNS = [
  {
    id:        "online_bonus_may2026",
    source:    "online",               // hanya untuk online order
    bonusPts:  10,
    startsAt:  new Date("2026-04-27T00:00:00+07:00"),
    endsAt:    new Date("2026-05-05T23:59:59+07:00"),  // 1 minggu
    label:     "Bonus Online Order +10 pts",
  },
  // Tambah campaign lain di sini — yang expired otomatis di-skip.
];

function getActiveCampaign(source) {
  const now = new Date();
  return CAMPAIGNS.find(
    (c) => c.source === source && now >= c.startsAt && now <= c.endsAt
  ) || null;
}

// ─────────────────────────────────────────────────────────────────────────────

function calcPoints(amountIDR) {
  return Math.floor(Number(amountIDR) / 10000) * 10;
}

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) { console.warn("[loyalty-add] SHEETS_URL not set"); return null; }
  try {
    const res  = await fetch(SHEETS_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
    });
    const text = await res.text();
    console.log("[loyalty-add] Sheets:", res.status, text.slice(0, 200));
    return JSON.parse(text);
  } catch (err) {
    console.error("[loyalty-add] Sheets error:", err.message);
    return null;
  }
}

async function sendWA(phone, message) {
  if (!FONNTE_TOKEN) return;
  try {
    await fetch("https://api.fonnte.com/send", {
      method:  "POST",
      headers: { Authorization: FONNTE_TOKEN, "Content-Type": "application/json" },
      body:    JSON.stringify({ target: normalizePhone(phone), message, countryCode: "62" }),
    });
  } catch (e) { console.error("[loyalty-add] WA error:", e.message); }
}

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const { phone, name, amountIDR, source = "online", txId } = JSON.parse(event.body || "{}");
    if (!phone || !amountIDR) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone and amountIDR required" }) };
    }

    const normalized = normalizePhone(phone);
    const basePts    = calcPoints(amountIDR);

    // ── Campaign bonus ──────────────────────────────────────────────────
    const campaign  = getActiveCampaign(source);
    const bonusPts  = campaign ? campaign.bonusPts : 0;
    const totalPts  = basePts + bonusPts;

    const noteBase  = `${basePts} pts dari ${source === "online" ? "online order" : "offline order"}`;
    const note      = bonusPts > 0
      ? `${noteBase} + ${bonusPts} bonus (${campaign.label})`
      : noteBase;

    if (bonusPts > 0) {
      console.log(`[loyalty-add] Campaign "${campaign.id}" aktif — +${bonusPts} bonus`);
    }

    // Langsung increment — Apps Script hitung poin lama + baru sekaligus
    const result    = await sheetsPost({
      action:   "increment_points",
      phone:    normalized,
      name:     name || "",
      points:   totalPts,
      addSpend: Number(amountIDR),
      source,
      txId:     txId || "",
      note,
    });

    const newPoints = result?.newPoints ?? totalPts;
    const custName  = name || "";

    // ── WA notif ────────────────────────────────────────────────────────
    const bonusLine = bonusPts > 0
      ? `\n🎉 *Bonus campaign: +${bonusPts} pts!*`
      : "";

    await sendWA(normalized,
      `Halo *${custName || "Kamu"}*! ☕\n\n` +
      `${source === "online" ? "Pesanan online" : "Kunjungan"} kamu di *Sector Seven* selesai!\n` +
      `Kamu dapat *+${totalPts} poin*.${bonusLine}\n` +
      `Total poin: *${newPoints} pts*\n\n` +
      `Cek & tukar poin: www.sectorseven.space/loyalty/`
    );

    console.log(`[loyalty-add] ${normalized} +${totalPts} pts (base=${basePts} bonus=${bonusPts}) → total ${newPoints}`);
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ ok: true, pointsEarned: totalPts, bonusPoints: bonusPts, totalPoints: newPoints }),
    };

  } catch (err) {
    console.error("[loyalty-add] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};