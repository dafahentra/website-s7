// src/services/mokaApi.js
const BASE = "/.netlify/functions";

// ── Fetch items dari Moka ─────────────────────────────────────────────────────
export async function fetchItems() {
  const res = await fetch(`${BASE}/moka-items`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `moka-items failed: ${res.status}`);
  }
  const data = await res.json();
  return data.items ?? [];
}

// ── Kirim order ke Moka Advanced Ordering ────────────────────────────────────
// extra opsional — berisi { final_price, price_context? }
// final_price selalu dikirim (untuk disimpan di Blobs).
// price_context hanya dikirim untuk free order (validasi server-side).
export async function submitOrder(orderPayload, extra = null) {
  const body = { order: orderPayload, ...(extra || {}) };

  const res = await fetch(`${BASE}/moka-checkout`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `moka-checkout failed: ${res.status}`);
  return data;
}

// ── Buat Midtrans SNAP token ──────────────────────────────────────────────────
export async function getMidtransToken({ order_id, amount, customer, items }) {
  const res = await fetch(`${BASE}/midtrans-token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order_id, amount, customer, items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `midtrans-token failed: ${res.status}`);
  return data; // { token, redirect_url }
}

// ── Validasi kode diskon dari Moka ───────────────────────────────────────────
export async function validateDiscount({ code, orderTotal }) {
  const res = await fetch(`${BASE}/validate-discount`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ code, orderTotal }),
  });

  const data = await res.json().catch(() => ({
    valid: false,
    error: "Response tidak valid dari server",
  }));

  if (!res.ok) {
    throw new Error(data?.error || `validate-discount failed: ${res.status}`);
  }

  return data;
}