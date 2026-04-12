// netlify/functions/loyalty-add.js
// POST — tambah poin (online order otomatis, atau manual)
// Body: { phone, name, amountIDR, source, txId }

import { getStore } from "@netlify/blobs";

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";
const FONNTE_TOKEN  = process.env.FONNTE_TOKEN;

function calcPoints(amountIDR) {
  return Math.floor(Number(amountIDR) / 10000) * 10;
}

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
  } catch (e) { console.error("[loyalty-add] WA error:", e.message); }
}

async function sheetsPost(payload) {
  if (!SHEETS_URL) return;
  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
    });
  } catch (e) { console.error("[loyalty-add] Sheets error:", e.message); }
}

export const handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  try {
    const { phone, name, amountIDR, source = "online", txId } = JSON.parse(event.body || "{}");
    if (!phone || !amountIDR) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone and amountIDR required" }) };

    const normalized = normalizePhone(phone);
    const custStore  = getStore("loyalty-customers");
    const procStore  = getStore("loyalty-processed");

    // Idempotency
    if (txId) {
      const already = await procStore.get(`tx:${txId}`).catch(() => null);
      if (already) return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, skipped: true }) };
    }

    const pts  = calcPoints(amountIDR);
    const now  = new Date().toISOString();
    const raw  = await custStore.get(normalized).catch(() => null);
    const customer = raw ? JSON.parse(raw) : { phone: normalized, name: name || "", points: 0, history: [], createdAt: now };
    if (name) customer.name = name; // Selalu update ke nama terbaru

    customer.points += pts;
    customer.history.unshift({ type: "earn", points: pts, amountIDR: Number(amountIDR), source, txId: txId || null, createdAt: now, note: `+${pts} pts dari ${source === "online" ? "online order" : "offline order"}` });
    if (customer.history.length > 100) customer.history = customer.history.slice(0, 100);

    await custStore.set(normalized, JSON.stringify(customer));
    if (txId) await procStore.set(`tx:${txId}`, "1");

    // WA notif
    await sendWA(normalized,
      `Halo *${customer.name || "Kamu"}*! ☕\n\n` +
      `${source === "online" ? "Pesanan online" : "Kunjungan"} kamu di *Sector Seven* tercatat!\n` +
      `Kamu dapat *+${pts} poin*.\n` +
      `Total poin: *${customer.points} pts*\n\n` +
      `Cek & tukar poin: sectorseven.space/loyalty`
    );

    // Sync Sheets
    sheetsPost({ action: "upsert_customer", phone: normalized, name: customer.name, points: customer.points, addSpend: Number(amountIDR) });
    sheetsPost({ action: "add_history", phone: normalized, name: customer.name, type: "earn", points: pts, amount: Number(amountIDR), source, txId, note: `+${pts} pts` });

    console.log(`[loyalty-add] ${normalized} +${pts} pts → total ${customer.points}`);
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, pointsEarned: pts, totalPoints: customer.points }) };

  } catch (err) {
    console.error("[loyalty-add] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};