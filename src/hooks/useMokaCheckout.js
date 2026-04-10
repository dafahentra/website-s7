// src/hooks/useMokaCheckout.js
// Midtrans SNAP payment → on success → Moka Advanced Order

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

// Sales type ID untuk "Online Order" di Moka
// Isi dengan ID dari: https://sectorseven.space/.netlify/functions/moka-get-sales-type
const ONLINE_ORDER_SALES_TYPE_ID = 602868;
const NOTIF_BASE = "https://sectorseven.space/.netlify/functions";
const fmtRp = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

// Simpan order payload ke Blobs sebagai safety net untuk midtrans-notify
async function savePendingOrder(orderId, orderPayload) {
  try {
    await fetch("/.netlify/functions/save-pending-order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderId, orderPayload }),
    });
  } catch (e) {
    console.warn("[checkout] Failed to save pending order:", e.message);
  }
}

const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_ENV === "production";
const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

function loadSnapScript(clientKey) {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(); return; }
    const existing = document.querySelector(`script[src="${SNAP_URL}"]`);
    if (existing) { existing.addEventListener("load", resolve); return; }
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", clientKey);
    script.onload  = resolve;
    script.onerror = () => reject(new Error("Gagal memuat Midtrans SNAP."));
    document.head.appendChild(script);
  });
}

// Buat ringkasan item untuk WA notification
function buildItemsSummary(cart) {
  return cart.map((e) => {
    const mods = (e.mokaModifiers ?? [])
      .filter((m) => m.modifier_option_name)
      .map((m) => m.modifier_option_name)
      .join(", ");
    const line = `${e.qty}x ${e.itemName}${e.mokaVariantName && e.mokaVariantName !== "Regular" ? ` (${e.mokaVariantName})` : ""}`;
    return mods ? `${line} - ${mods}` : line;
  }).join("|");
}

async function sendMokaOrder(cart, {
  applicationOrderId, name, phone, orderNote,
  discount, discountAmount, finalPrice,
}) {
  const hasDiscount = discountAmount > 0 && discount?.mokaId;

  const order_items = cart.map((entry) => {
    // item_price_library = harga DASAR (tanpa modifier)
    // Moka menambah modifier price sendiri dari item_modifiers
    const modifierSum = (entry.mokaModifiers ?? [])
      .reduce((s, m) => s + round(m.modifier_option_price ?? 0), 0);
    const basePrice = round(entry.unitPrice) - modifierSum;

    const item = {
      item_id:            entry.mokaItemId,
      item_name:          entry.itemName,
      quantity:           entry.qty,
      item_variant_id:    entry.mokaVariantId,
      item_variant_name:  entry.mokaVariantName || "Regular",
      item_price_library: basePrice,
      category_id:        entry.mokaCategoryId,
      category_name:      entry.mokaCategoryName || "",
      note:               "",
    };

    if (entry.mokaModifiers?.length) {
      item.item_modifiers = entry.mokaModifiers.map((mod) => ({
        item_modifier_id:           mod.modifier_id,
        item_modifier_name:         mod.modifier_name,
        item_modifier_option_id:    mod.modifier_option_id,
        item_modifier_option_name:  mod.modifier_option_name,
        item_modifier_option_price: round(mod.modifier_option_price ?? 0),
      }));
    }

    return item;
  });

  // Diskon native Moka
  const discountFields = hasDiscount ? {
    discount_id:     discount.mokaId,
    discount_name:   discount.mokaName  || discount.code,
    discount_type:   discount.mokaType  || (discount.type === "percentage" ? "percentage" : "cash"),
    discount_amount: discount.value,
    ...(discount.mokaGuid ? { discount_guid: discount.mokaGuid } : {}),
  } : {};

  // Note singkat untuk kasir
  const noteParts = [
    orderNote,
    `Total ${fmtRp(finalPrice)}`,
  ].filter(Boolean).join(" | ");

  await submitOrder({
    application_order_id:  applicationOrderId,
    payment_type:          "online_orders",
    client_created_at:     new Date().toISOString(),
    note:                  noteParts.slice(0, 255),
    // Moka limits: customer_name max 50 chars, customer_phone_number max 13 digits
    customer_name:         name.trim().slice(0, 50),
    customer_phone_number: phone.replace(/\s|-|\+/g, '').replace(/^0/, '62').slice(0, 13),
    sales_type_id:   ONLINE_ORDER_SALES_TYPE_ID,
    sales_type_name: "Online Order",
    accept_order_notification_url:   `${NOTIF_BASE}/order-notify?event=accepted&order=${applicationOrderId}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&total=${finalPrice}&items=${encodeURIComponent(buildItemsSummary(cart))}`,
    complete_order_notification_url: `${NOTIF_BASE}/order-notify?event=completed&order=${applicationOrderId}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&total=${finalPrice}&items=${encodeURIComponent(buildItemsSummary(cart))}`,
    cancel_order_notification_url:   `${NOTIF_BASE}/order-notify?event=cancelled&order=${applicationOrderId}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`,
    ...discountFields,
    order_items,
  });
}

export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  const checkout = useCallback(async (cart, customerInfo = {}) => {
    if (!cart.length) throw new Error("Keranjang kosong");
    setSubmitting(true);

    try {
      const applicationOrderId = `S7-${Date.now()}`;

      const {
        name           = "Customer",
        phone          = "",
        orderNote      = "",
        discount       = null,
        subtotal       = cart.reduce((s, e) => s + round(e.unitPrice * e.qty), 0),
        discountAmount = discount?.discountAmount || 0,
        finalPrice     = Math.max(0, subtotal - discountAmount),
      } = customerInfo;

      const mokaPayload = { applicationOrderId, name, phone, orderNote, discount, discountAmount, finalPrice };

      // ── KASUS KHUSUS: diskon 100% (finalPrice = 0) ───────────────────────────
      // Midtrans menolak amount = 0, jadi langsung submit ke Moka tanpa payment
      if (finalPrice <= 0) {
        try {
          await sendMokaOrder(cart, mokaPayload);
          return { success: true, order_id: applicationOrderId, free: true };
        } catch (err) {
          throw new Error(`Order gagal: ${err.message}`);
        }
      }

      // ── Midtrans item list ───────────────────────────────────────────────────
      const midtransItems = [
        ...cart.map((e) => ({
          id:       String(e.mokaVariantId || e.mokaItemId || "item"),
          price:    round(e.unitPrice),
          quantity: e.qty,
          name:     [e.itemName, e.mokaVariantName].filter(Boolean).join(" - ").slice(0, 50),
        })),
        ...(discountAmount > 0 && discount ? [{
          id: "DISCOUNT", price: -discountAmount, quantity: 1,
          name: (discount.description || `Diskon ${discount.code}`).slice(0, 50),
        }] : []),
      ];

      // ── 1. Midtrans token ────────────────────────────────────────────────────
      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount:   round(finalPrice),
        customer: { name, phone },
        items:    midtransItems,
      });

      // ── 2. Load Snap.js ──────────────────────────────────────────────────────
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("VITE_MIDTRANS_CLIENT_KEY tidak ditemukan.");
      await loadSnapScript(clientKey);

      // ── 3. Simpan pending order sebagai safety net ─────────────────────────────
      // Kalau onSuccess tidak terpanggil (browser tutup dll), midtrans-notify
      // akan ambil data ini dan kirim ke Moka
      const mokaOrderPayload = await buildMokaPayload(cart, mokaPayload);
      await savePendingOrder(applicationOrderId, mokaOrderPayload);

      // ── 4. Buka popup ────────────────────────────────────────────────────────
      return new Promise((resolve, reject) => {
        window.snap.pay(token, {

          onSuccess: async () => {
            try {
              await sendMokaOrder(cart, mokaPayload);
              resolve({ success: true, order_id: applicationOrderId });
            } catch (mokaErr) {
              console.error("[checkout] Moka GAGAL:", mokaErr.message);
              reject(new Error(
                `Pembayaran berhasil (${applicationOrderId}) tapi order gagal masuk sistem. ` +
                `Tunjukkan kode ini ke kasir: ${applicationOrderId}`
              ));
            }
          },

          onPending: () => resolve({ success: false, pending: true }),
          onError:   () => reject(new Error("Pembayaran gagal. Silakan coba lagi.")),
          onClose:   () => reject(new Error("Pembayaran dibatalkan.")),
        });
      });

    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}