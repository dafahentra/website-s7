// netlify/functions/moka-checkout.js
// Forwards cart checkout to Moka POS.
// Uses refresh_token flow via moka-token.js helper.

const MOKA_BASE = "https://api.mokapos.com";
const { getValidToken } = require("./moka-token");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { checkout } = JSON.parse(event.body || "{}");
    if (!checkout) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing checkout payload" }),
      };
    }

    const token    = await getValidToken();
    const outletId = process.env.MOKA_OUTLET_ID;

    if (!outletId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "MOKA_OUTLET_ID not set" }),
      };
    }

    const res = await fetch(`${MOKA_BASE}/v1/outlets/${outletId}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ checkout }),
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};