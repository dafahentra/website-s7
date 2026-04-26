// netlify/functions/loyalty-get.js
// GET ?phone=08xxx → customer data + available rewards
// Source of truth: Google Sheets

const SHEETS_URL    = process.env.LOYALTY_SHEETS_URL;
const SHEETS_SECRET = process.env.LOYALTY_SHEETS_SECRET || "s7loyalty2026";

// HARUS sync dengan REWARDS di loyalty-redeem.js — sama persis
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

async function sheetsGet(params) {
  const url = new URL(SHEETS_URL);
  url.searchParams.set("secret", SHEETS_SECRET);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type":                "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };

  try {
    const phone = event.queryStringParameters?.phone;
    if (!phone) {
      return {
        statusCode: 400, headers: cors,
        body: JSON.stringify({ error: "phone required" }),
      };
    }

    const normalized = normalizePhone(phone);
    const data       = await sheetsGet({ action: "get_customer", phone: normalized });

    if (!data.found) {
      return {
        statusCode: 200, headers: cors,
        body: JSON.stringify({
          found:      false,
          phone:      normalized,
          allRewards: REWARDS,
        }),
      };
    }

    const availableRewards = REWARDS.filter((r) => data.points >= r.points);

    return {
      statusCode: 200, headers: cors,
      body: JSON.stringify({
        found:            true,
        phone:            data.phone,
        name:             data.name,
        points:           data.points,
        availableRewards,
        allRewards:       REWARDS,
        history:          data.history || [],
      }),
    };
  } catch (err) {
    console.error("[loyalty-get] Error:", err.message);
    return {
      statusCode: 500, headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};