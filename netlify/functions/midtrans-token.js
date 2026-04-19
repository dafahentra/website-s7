// netlify/functions/midtrans-token.js
// Membuat Midtrans SNAP transaction token
// Sandbox: https://app.sandbox.midtrans.com/snap/v1
// Production: https://app.midtrans.com/snap/v1

const IS_PRODUCTION  = process.env.MIDTRANS_ENV === "production";
const MIDTRANS_BASE  = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

export const handler = async (event) => {
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
    const { order_id, amount, customer, items } = JSON.parse(event.body || "{}");

    if (!order_id || !amount || !customer) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Missing required fields: order_id, amount, customer" }),
      };
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "MIDTRANS_SERVER_KEY not set" }),
      };
    }

    const authHeader = "Basic " + Buffer.from(serverKey + ":").toString("base64");

    const payload = {
      transaction_details: {
        order_id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer.name  || "Customer",
        phone:      customer.phone || "",
      },
      item_details: items || [],
      callbacks: {
        finish: `${process.env.URL || "https://sectorseven.space"}/menu`,
      },
    };

    console.log("[midtrans-token] env:", IS_PRODUCTION ? "production" : "sandbox");
    console.log("[midtrans-token] order_id:", order_id, "amount:", amount);

    const res = await fetch(`${MIDTRANS_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[midtrans-token] response:", res.status, JSON.stringify(data));

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: data?.error_messages?.[0] || JSON.stringify(data) }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ token: data.token, redirect_url: data.redirect_url }),
    };
  } catch (err) {
    console.error("[midtrans-token] Unhandled error:", err.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};