// netlify/functions/loyalty-get.js
// GET ?phone=08xxx → customer data + available rewards
// Source of truth: Google Sheets

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";

const REWARDS = [
  { id: "free_regular",  points: 100,  label: "Free Regular Drink",     description: "Claim 1 free any regular-sized beverage",  mokaDiscountName: "REWARD_100PTS"  },
  { id: "free_large", points: 120,  label: "Free Large Drink", description: "Claim 1 free any large-sized beverage", mokaDiscountName: "REWARD_120PTS"  },
  { id: "free_combo",   points: 180, label: "Free Combo",   description: "Claim 2 regular drinks OR 1 regular drink + pastry",   mokaDiscountName: "REWARD_180PTS" },
];

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

async function sheetsGet(params) {
  const url = new URL(SHEETS_URL);
  url.searchParams.set("secret", SHEETS_SECRET);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export const handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };

  try {
    const phone      = event.queryStringParameters?.phone;
    if (!phone) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone required" }) };

    const normalized = normalizePhone(phone);
    const data       = await sheetsGet({ action: "get_customer", phone: normalized });

    if (!data.found) {
      return { statusCode: 200, headers: cors, body: JSON.stringify({ found: false, phone: normalized, allRewards: REWARDS }) };
    }

    const availableRewards = REWARDS.filter((r) => data.points >= r.points);
    return {
      statusCode: 200, headers: cors,
      body: JSON.stringify({ found: true, phone: data.phone, name: data.name, points: data.points, availableRewards, allRewards: REWARDS, history: data.history || [] }),
    };
  } catch (err) {
    console.error("[loyalty-get] Error:", err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};