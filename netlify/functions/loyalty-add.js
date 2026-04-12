// netlify/functions/loyalty-add.js
// POST — tambah poin customer
// Pakai increment_points di Apps Script — tidak perlu GET dulu, lebih cepat

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;

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
    const pts        = calcPoints(amountIDR);
    const note       = `${pts} pts dari ${source === "online" ? "online order" : "offline order"}`;

    // Langsung increment — Apps Script hitung poin lama + baru sekaligus (no GET roundtrip)
    const result    = await sheetsPost({
      action:   "increment_points",
      phone:    normalized,
      name:     name || "",
      points:   pts,
      addSpend: Number(amountIDR),
      source,
      txId:     txId || "",
      note,
    });

    const newPoints = result?.newPoints ?? pts;
    const custName  = name || "";

    // WA notif — kirim setelah Sheets update
    await sendWA(normalized,
      `Halo *${custName || "Kamu"}*! ☕\n\n` +
      `${source === "online" ? "Pesanan online" : "Kunjungan"} kamu di *Sector Seven* selesai!\n` +
      `Kamu dapat *+${pts} poin*.\n` +
      `Total poin: *${newPoints} pts*\n\n` +
      `Cek & tukar poin: www.sectorseven.space/loyalty`
    );

    console.log(`[loyalty-add] ${normalized} +${pts} pts → total ${newPoints}`);
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ ok: true, pointsEarned: pts, totalPoints: newPoints }),
    };

  } catch (err) {
    console.error("[loyalty-add] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};