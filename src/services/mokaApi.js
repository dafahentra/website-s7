// src/services/mokaApi.js
// Thin wrapper around Netlify proxy functions for Moka POS API.

const BASE = "/.netlify/functions";

// ── Fetch all items from Moka ─────────────────────────────────────────────────
export async function fetchItems() {
  const res = await fetch(`${BASE}/moka-items`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `moka-items failed: ${res.status}`);
  }

  const data = await res.json();
  return data.items ?? [];
}

// ── Submit checkout to Moka ───────────────────────────────────────────────────
export async function submitCheckout(checkoutPayload) {
  const res = await fetch(`${BASE}/moka-checkout`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ checkout: checkoutPayload }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `moka-checkout failed: ${res.status}`);
  }

  return data;
}