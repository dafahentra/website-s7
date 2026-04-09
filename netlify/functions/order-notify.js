// netlify/functions/order-notify.js
// Menerima webhook dari Moka saat status order berubah,
// lalu kirim notifikasi WhatsApp ke customer via Fonnte.
//
// Karena Moka webhook TIDAK mengirim customer data di body,
// kita fetch dulu order detail dari Moka API pakai application_order_id.

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const MOKA_BASE    = process.env.MOKA_BASE_URL || "https://api.mokapos.com";
const STORE_NAME   = "Sector Seven";

// ── Moka token cache (in-memory, resets per cold start) ───────────────────────
let _tokenCache = null;

async function getMokaToken() {
  if (_tokenCache && Date.now() < _tokenCache.expires_at) {
    return _tokenCache.access_token;
  }

  // Coba pakai access token langsung dulu
  if (!_tokenCache && process.env.MOKA_ACCESS_TOKEN) {
    _tokenCache = {
      access_token:  process.env.MOKA_ACCESS_TOKEN,
      refresh_token: process.env.MOKA_REFRESH_TOKEN,
      expires_at:    Date.now() + (15552000 - 60) * 1000,
    };
    return _tokenCache.access_token;
  }

  // Refresh token
  const refreshToken = _tokenCache?.refresh_token || process.env.MOKA_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("MOKA_REFRESH_TOKEN not set");

  const res  = await fetch(`${MOKA_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:    "refresh_token",
      client_id:     process.env.MOKA_CLIENT_ID,
      client_secret: process.env.MOKA_SECRET,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || `Token refresh failed: ${res.status}`);

  _tokenCache = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at:    Date.now() + ((data.expires_in || 7200) - 60) * 1000,
  };

  return _tokenCache.access_token;
}

// ── Fetch order detail dari Moka untuk ambil customer phone ──────────────────
async function fetchOrderDetail(applicationOrderId) {
  const outletId = process.env.MOKA_OUTLET_ID;
  if (!outletId) throw new Error("MOKA_OUTLET_ID not set");

  const token = await getMokaToken();
  const url   = `${MOKA_BASE}/v1/outlets/${outletId}/advanced_orderings/orders/${applicationOrderId}`;

  console.log(`[order-notify] Fetching order detail: ${url}`);

  const res  = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  console.log(`[order-notify] Moka order detail status: ${res.status}`);
  console.log(`[order-notify] Moka order detail:`, JSON.stringify(data));

  if (!res.ok) {
    throw new Error(`Moka API error ${res.status}: ${data?.meta?.error_message || "unknown"}`);
  }

  // Response: { data: [ { ...order } ], meta: { code: 200 } }
  const order = Array.isArray(data.data) ? data.data[0] : data.data;
  return order || null;
}

// ── Pesan WA ──────────────────────────────────────────────────────────────────
const MESSAGES = {
  accepted: (name, orderId) =>
    `Halo *${name}*! 👋\n\n` +
    `Pesanan kamu (*${orderId}*) sudah diterima dan sedang diproses barista kami. ☕\n\n` +
    `Mohon tunggu sebentar ya~`,

  completed: (name, orderId) =>
    `Halo *${name}*! ✅\n\n` +
    `Pesanan kamu (*${orderId}*) sudah selesai dan siap diambil!\n\n` +
    `Silakan ambil di kasir. Terima kasih sudah order di *${STORE_NAME}* 🖤`,

  cancelled: (name, orderId) =>
    `Halo *${name}*. ℹ️\n\n` +
    `Maaf, pesanan kamu (*${orderId}*) dibatalkan.\n\n` +
    `Silakan hubungi kami langsung di kasir. Terima kasih.`,
};

// ── Kirim WA via Fonnte ───────────────────────────────────────────────────────
async function sendWhatsApp(phone, message) {
  if (!FONNTE_TOKEN) {
    console.warn("[order-notify] FONNTE_TOKEN not set — skipping");
    return { skipped: true };
  }

  // Normalisasi ke format 62xxx
  const normalized = phone
    .replace(/[\s\-]/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "62");

  console.log(`[order-notify] Sending WA to ${normalized}`);

  const res  = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": FONNTE_TOKEN,
      "Content-Type":  "application/json",
    },
    // countryCode dihapus — menyebabkan error di Fonnte
    body: JSON.stringify({ target: normalized, message }),
  });

  const data = await res.json().catch(() => ({}));
  console.log("[order-notify] Fonnte response:", JSON.stringify(data));
  return data;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const q         = event.queryStringParameters || {};
    const eventType = q.event || "unknown";
    const orderId   = q.order || "-";

    // Body dari Moka (biasanya kosong / tidak ada customer data)
    let body = {};
    if (event.body) {
      try { body = JSON.parse(event.body); } catch { /* ignore */ }
    }
    console.log(`[order-notify] event=${eventType} order=${orderId}`);
    console.log(`[order-notify] raw body:`, JSON.stringify(body));

    const msgFn = MESSAGES[eventType];
    if (!msgFn) {
      console.warn("[order-notify] Unknown event type:", eventType);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "unknown_event" }) };
    }

    // Coba ambil phone dari body webhook dulu, fallback ke Moka API
    let customerName  = body.customer_name         || body.name  || "";
    let customerPhone = body.customer_phone_number || body.phone || "";

    if (!customerPhone && orderId !== "-") {
      console.log(`[order-notify] No phone in webhook body, fetching from Moka API...`);
      try {
        const order = await fetchOrderDetail(orderId);
        customerName  = customerName  || order?.customer_name         || "Pelanggan";
        customerPhone = customerPhone || order?.customer_phone_number || "";
        console.log(`[order-notify] From Moka API — name=${customerName} phone=${customerPhone}`);
      } catch (fetchErr) {
        console.error("[order-notify] Failed to fetch order detail:", fetchErr.message);
      }
    }

    customerName = customerName || "Pelanggan";

    if (!customerPhone) {
      console.warn("[order-notify] No phone number found — skipping WA");
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: true, reason: "no_phone" }) };
    }

    const result = await sendWhatsApp(customerPhone, msgFn(customerName, orderId));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, event: eventType, order: orderId, wa: result }),
    };

  } catch (err) {
    console.error("[order-notify] Error:", err.message);
    // Selalu return 200 agar Moka tidak retry webhook
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};