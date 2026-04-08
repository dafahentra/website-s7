// netlify/functions/validate-discount.js
// Validasi kode diskon langsung dari Moka — tanpa file config, tanpa database.
//
// Cara pakai di Moka Backoffice:
//   Library → Diskon → Tambah Diskon
//   Nama diskon  = kode yang diketik customer di website  (misal "SEKTOR10")
//   Jumlah       = nilai diskon
//   Tipe         = Persentase / Nominal
//
// Hapus diskon di Moka → otomatis tidak bisa dipakai di web.

const MOKA_BASE    = "https://api.mokapos.com";
const OUTLET_ID    = process.env.MOKA_OUTLET_ID;
const ACCESS_TOKEN = process.env.MOKA_ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.MOKA_REFRESH_TOKEN;
const CLIENT_ID    = process.env.MOKA_CLIENT_ID;
const CLIENT_SECRET = process.env.MOKA_SECRET;

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

async function getAccessToken() {
  // Coba pakai access token dari env dulu
  // Kalau expired, refresh dengan refresh token
  if (ACCESS_TOKEN) return ACCESS_TOKEN;

  const res = await fetch(`${MOKA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh gagal: ${res.status}`);
  return data.access_token;
}

async function getMokaDiscounts(token) {
  const res = await fetch(
    `${MOKA_BASE}/v1/outlets/${OUTLET_ID}/discounts?per_page=200`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Kalau 401, coba refresh token
  if (res.status === 401) {
    const refreshRes = await fetch(`${MOKA_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type:    "refresh_token",
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
      }),
    });
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) throw new Error("Token expired dan gagal direfresh");

    const retryRes = await fetch(
      `${MOKA_BASE}/v1/outlets/${OUTLET_ID}/discounts?per_page=200`,
      { headers: { Authorization: `Bearer ${refreshData.access_token}` } }
    );
    const retryData = await retryRes.json();
    if (!retryRes.ok) throw new Error(`Gagal ambil diskon: ${retryRes.status}`);
    return retryData?.data?.discount ?? [];
  }

  const data = await res.json();
  if (!res.ok) throw new Error(`Gagal ambil diskon dari Moka: ${res.status}`);
  return data?.data?.discount ?? [];
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch (_) {}

    const { code, orderTotal = 0 } = body;

    if (!code || !String(code).trim()) {
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ valid: false, error: "Kode diskon tidak boleh kosong" }),
      };
    }

    const inputCode = String(code).trim().toUpperCase();

    // Ambil daftar diskon dari Moka
    const token     = await getAccessToken();
    const discounts = await getMokaDiscounts(token);

    console.log(`[validate-discount] Checking code "${inputCode}" against ${discounts.length} Moka discounts`);

    // Cocokkan nama diskon (case-insensitive), skip yang sudah dihapus
    const matched = discounts.find(
      (d) => !d.is_deleted && d.name.trim().toUpperCase() === inputCode
    );

    if (!matched) {
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({
          valid: false,
          error: "Kode diskon tidak ditemukan atau sudah tidak berlaku",
        }),
      };
    }

    // Hitung nilai diskon
    // Moka: type "cash" = nominal, type "percentage" = persen
    const amount = Number(matched.amount) || 0;
    let discountAmount = 0;

    if (matched.type === "percentage") {
      discountAmount = Math.round((Number(orderTotal) * amount) / 100);
    } else {
      discountAmount = Math.min(amount, Number(orderTotal));
    }

    const fmt       = (n) => new Intl.NumberFormat("id-ID").format(n);
    const typeLabel = matched.type === "percentage" ? `${amount}%` : `Rp${fmt(amount)}`;
    const description = `Diskon ${matched.name} (${typeLabel})`;

    console.log(`[validate-discount] ✓ "${inputCode}" valid — diskon Rp${fmt(discountAmount)}`);

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        valid:          true,
        code:           inputCode,
        mokaId:         matched.id,
        mokaGuid:       matched.guid   || null,
        mokaName:       matched.name,
        mokaType:       matched.type,          // "cash" atau "percentage" — untuk dikirim ke Moka order
        type:           matched.type === "percentage" ? "percentage" : "fixed",
        value:          amount,
        discountAmount,
        description,
      }),
    };
  } catch (err) {
    console.error("[validate-discount] Error:", err.message);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({
        valid: false,
        error: "Gagal menghubungi server. Coba lagi.",
        _debug: err.message, // hanya tampil di Netlify logs
      }),
    };
  }
};