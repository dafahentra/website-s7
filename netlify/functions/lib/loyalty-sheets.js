// netlify/functions/lib/loyalty-sheets.js
// Helper untuk sync data ke Google Sheets via Apps Script Web App

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";

async function sheetsPost(payload) {
  if (!SHEETS_URL) {
    console.warn("[loyalty-sheets] LOYALTY_SHEETS_URL not set — skipping Sheets sync");
    return;
  }
  try {
    const res = await fetch(SHEETS_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...payload, secret: SHEETS_SECRET }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) console.error("[loyalty-sheets] Error:", JSON.stringify(data));
  } catch (err) {
    console.error("[loyalty-sheets] Fetch error:", err.message);
  }
}

export async function sheetsUpsertCustomer({ phone, name, points, addSpend = 0 }) {
  return sheetsPost({ action: "upsert_customer", phone, name, points, addSpend });
}

export async function sheetsAddHistory({ phone, name, type, points, amount, source, txId, note }) {
  return sheetsPost({ action: "add_history", phone, name, type, points, amount, source, txId, note });
}