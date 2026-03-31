// netlify/functions/moka-exchange-code.js
// ONE-TIME USE during setup: exchanges authorization code for access+refresh token.
// Called from moka-setup.html — keeps client_secret server-side.

const MOKA_BASE = "https://api.mokapos.com";

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
    const { code, redirect_uri } = JSON.parse(event.body || "{}");
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing code parameter" }),
      };
    }

    const res = await fetch(`${MOKA_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type:    "authorization_code",
        client_id:     process.env.MOKA_CLIENT_ID,
        client_secret: process.env.MOKA_SECRET,
        code,
        redirect_uri,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error: data?.error_description || data?.error || "Exchange failed",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        expires_in:    data.expires_in,
        scope:         data.scope,
        token_type:    data.token_type,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};