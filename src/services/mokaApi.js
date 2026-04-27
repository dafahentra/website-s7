// src/services/mokaApi.js
const BASE = "/.netlify/functions";

export async function fetchItems() {
  const res = await fetch(`${BASE}/moka-items`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `moka-items failed: ${res.status}`);
  }
  const data = await res.json();
  return data.items ?? [];
}

// Simpan order ke Blobs SEBELUM payment — dipanggil frontend.
// midtrans-notify akan baca ini setelah settlement → submit ke Moka.
export async function savePendingOrder(payload) {
  const res = await fetch(`${BASE}/save-pending-order`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `save-pending-order failed: ${res.status}`);
  return data;
}

// Submit order ke Moka — dipanggil untuk FREE order dari frontend.
// Untuk paid order, hanya dipanggil oleh midtrans-notify (server-side).
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

export async function getMidtransToken({ order_id, amount, customer, items }) {
  const res = await fetch(`${BASE}/midtrans-token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order_id, amount, customer, items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `midtrans-token failed: ${res.status}`);
  return data;
}

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
  if (!res.ok) throw new Error(data?.error || `validate-discount failed: ${res.status}`);
  return data;
}