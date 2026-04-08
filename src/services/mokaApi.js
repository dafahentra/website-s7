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
export async function submitOrder(orderPayload) {
  const res = await fetch(`${BASE}/moka-checkout`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order: orderPayload }),
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
// Kode yang diketik customer dicocokkan dengan nama diskon di Moka Backoffice.
// Jika diskon dihapus di Moka → otomatis tidak valid.
export async function validateDiscount({ code, orderTotal }) {
  const res = await fetch(`${BASE}/validate-discount`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ code, orderTotal }),
  });

  // parse body dulu sebelum cek res.ok agar pesan error Moka ikut terbaca
  const data = await res.json().catch(() => ({
    valid: false,
    error: "Response tidak valid dari server",
  }));

  if (!res.ok) {
    throw new Error(data?.error || `validate-discount failed: ${res.status}`);
  }

  return data; // { valid, code, discountAmount, description, ... }
}