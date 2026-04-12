// netlify/functions/loyalty-get.js
// GET ?phone=08xxx → return customer data + available rewards

import { getStore } from "@netlify/blobs";

const REWARDS = [
  { id: "discount_3k",  points: 50,  label: "Diskon Rp3.000",      description: "Potongan Rp3.000 untuk pembelian apapun", mokaDiscountName: "REWARD_50PTS" },
  { id: "free_regular", points: 80,  label: "Free Regular Drink",  description: "1 minuman regular gratis (maks Rp25.000)",  mokaDiscountName: "REWARD_80PTS" },
  { id: "free_large",   points: 100, label: "Free Large Drink",    description: "1 minuman large gratis (maks Rp30.000)",    mokaDiscountName: "REWARD_100PTS" },
];

function normalizePhone(phone) {
  return String(phone).replace(/[\s\-]/g, "").replace(/^\+/, "").replace(/^0/, "62");
}

export const handler = async (event) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };

  try {
    const phone = event.queryStringParameters?.phone;
    if (!phone) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "phone required" }) };

    const normalized = normalizePhone(phone);
    const store      = getStore("loyalty-customers");
    const raw        = await store.get(normalized).catch(() => null);

    if (!raw) {
      return { statusCode: 200, headers: cors, body: JSON.stringify({ found: false, phone: normalized, allRewards: REWARDS }) };
    }

    const customer       = JSON.parse(raw);
    const availableRewards = REWARDS.filter((r) => customer.points >= r.points);

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        found:            true,
        phone:            customer.phone,
        name:             customer.name,
        points:           customer.points,
        availableRewards,
        allRewards:       REWARDS,
        history:          (customer.history || []).slice(0, 20),
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};