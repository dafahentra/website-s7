/**
 * store-status.js
 * Netlify Function — Baca dan update status toko
 *
 * GET  → { isOpen, unavailableItems[] }           — publik
 * POST → { baristaId, pin, action, ...payload }   — butuh validasi barista
 *
 * action: 'setOpen' | 'toggleItem'
 */

import { getStore } from "@netlify/blobs";

const APPS_SCRIPT_URL   = process.env.PRESENSI_SCRIPT_URL; // URL Apps Script presensi
const NETLIFY_SITE_ID   = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const STORE_KEY         = "store-status";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type":                 "application/json",
};

function getBlobs() {
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({ name: "store-config", siteID: NETLIFY_SITE_ID, token: NETLIFY_API_TOKEN });
  }
  return getStore("store-config");
}

async function readStatus() {
  try {
    const data = await getBlobs().get(STORE_KEY, { type: "json" });
    return data || { isOpen: true, unavailableItems: [] };
  } catch {
    return { isOpen: true, unavailableItems: [] };
  }
}

async function writeStatus(status) {
  await getBlobs().setJSON(STORE_KEY, status);
}

// Validasi barista via Apps Script verifyPin endpoint
async function validateBarista(baristaId, pin) {
  if (!APPS_SCRIPT_URL) {
    console.error("[store-status] PRESENSI_SCRIPT_URL tidak diset");
    return { success: false, message: "Server tidak terkonfigurasi" };
  }

  try {
    const url = `${APPS_SCRIPT_URL}?action=verifyPin&baristaId=${encodeURIComponent(baristaId)}&pin=${encodeURIComponent(pin)}`;
    const res  = await fetch(url, { redirect: "follow" });
    const data = await res.json();
    return data; // { success, name?, message? }
  } catch (err) {
    console.error("[store-status] Gagal validasi barista:", err.message);
    return { success: false, message: "Gagal menghubungi server presensi" };
  }
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }

  // ── GET — publik ─────────────────────────────────────────────────────────
  if (event.httpMethod === "GET") {
    const status = await readStatus();
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ success: true, ...status }),
    };
  }

  // ── POST — butuh validasi barista ─────────────────────────────────────────
  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: "Invalid JSON" }) };
    }

    const { baristaId, pin, action } = body;

    if (!baristaId || !pin) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: "baristaId dan pin diperlukan" }) };
    }

    // Validasi barista
    const auth = await validateBarista(baristaId, pin);
    if (!auth.success) {
      return { statusCode: 403, headers: cors, body: JSON.stringify({ success: false, message: auth.message || "Akses ditolak" }) };
    }

    const current = await readStatus();

    // ── Buka / tutup toko ──────────────────────────────────────────────────
    if (action === "setOpen") {
      const isOpen = Boolean(body.isOpen);
      await writeStatus({ ...current, isOpen });
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({
          success: true,
          message: `Toko ${isOpen ? "dibuka" : "ditutup"} oleh ${auth.name}`,
          isOpen,
        }),
      };
    }

    // ── Toggle ketersediaan item ───────────────────────────────────────────
    if (action === "toggleItem") {
      const { itemId, available } = body;
      if (!itemId) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: "itemId diperlukan" }) };
      }

      let unavailableItems = current.unavailableItems || [];
      if (available) {
        unavailableItems = unavailableItems.filter((id) => id !== String(itemId));
      } else {
        if (!unavailableItems.includes(String(itemId))) unavailableItems.push(String(itemId));
      }

      await writeStatus({ ...current, unavailableItems });
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ success: true, unavailableItems }),
      };
    }

    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ success: false, message: "Action tidak dikenal" }),
    };
  }

  return { statusCode: 405, headers: cors, body: "Method Not Allowed" };
};