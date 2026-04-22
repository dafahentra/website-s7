// src/hooks/useMokaCheckout.js
//
// FLOW BENAR:
//   1. Simpan payload ke Blobs (save-pending-order) — belum submit ke Moka
//   2. Buka Midtrans SNAP
//   3. Setelah settlement → midtrans-notify.js yang submit ke Moka

import { useState, useCallback } from "react";
import { getMidtransToken } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

const ONLINE_ORDER_SALES_TYPE_ID = 602868;
const NETLIFY_FUNC = "/.netlify/functions"; // ← relative, aman di semua env

const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_ENV === "production";
const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

/**
 * Bangun Moka order payload.
 * Callback URL → moka-callback (BUKAN order-notify).
 */
function buildMokaOrderPayload({
  applicationOrderId, name, phone, orderNote,
  discount, discountAmount, onlineFee, cart,
}) {
  const normalizedPhone = phone
    .replace(/[\s-]/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "62")
    .slice(0, 13);

  const hasDiscount = discountAmount > 0 && discount?.mokaId;

  const order_items = cart.map((entry) => {
    const modifierSum = (entry.mokaModifiers ?? [])
      .reduce((s, m) => s + round(m.modifier_option_price ?? 0), 0);
    const basePrice = round(entry.unitPrice) - modifierSum;

    const mokaItem = {
      item_id:            entry.mokaItemId,
      item_name:          entry.itemName,
      item_price_library: basePrice,
      quantity:           entry.qty,
      item_variant_id:    entry.mokaVariantId   || null,
      item_variant_name:  entry.mokaVariantName || "Regular",
      category_id:        entry.mokaCategoryId  || null,
      category_name:      entry.mokaCategoryName || "",
      note:               entry.itemNote || "",
    };

    if (entry.mokaModifiers?.length) {
      mokaItem.item_modifiers = entry.mokaModifiers.map((m) => ({
        item_modifier_id:           m.modifier_id,
        item_modifier_name:         m.modifier_name         || "",
        item_modifier_option_id:    m.modifier_option_id,
        item_modifier_option_name:  m.modifier_option_name  || "",
        item_modifier_option_price: round(m.modifier_option_price ?? 0),
      }));
    }

    return mokaItem;
  });

  return {
    customer_name:         name.slice(0, 50),
    customer_phone_number: normalizedPhone,
    application_order_id:  applicationOrderId,
    sales_type_id:         ONLINE_ORDER_SALES_TYPE_ID,
    sales_type_name:       "Online Order",
    client_created_at:     new Date().toISOString(),
    ...(orderNote ? { note: orderNote } : {}),

    // ── Callback URL → moka-callback ──────────────────────────────────────────
    complete_order_notification_url: `https://sectorseven.space/.netlify/functions/moka-callback?secret=64TbQqjQcFNOx73Sw2LwneEZq497UOuo`,
    accept_order_notification_url:   `https://sectorseven.space/.netlify/functions/moka-callback?secret=64TbQqjQcFNOx73Sw2LwneEZq497UOuo`,
    cancel_order_notification_url:   `https://sectorseven.space/.netlify/functions/moka-callback?secret=64TbQqjQcFNOx73Sw2LwneEZq497UOuo`,

    ...(hasDiscount
      ? {
          discount_id:     discount.mokaId,
          discount_type:   discount.mokaType || (discount.type === "percentage" ? "percentage" : "cash"),
          discount_amount: discount.value,
          discount_name:   (discount.mokaName || discount.description || discount.code || "").slice(0, 50),
          ...(discount.mokaGuid ? { discount_guid: discount.mokaGuid } : {}),
        }
      : {}),

    order_items,
  };
}

/**
 * Simpan order ke Blobs.
 * Pakai relative URL — tidak bergantung pada env var domain.
 * Tidak submit ke Moka — midtrans-notify.js yang handle setelah settlement.
 */
async function savePendingOrder({ applicationOrderId, orderPayload, name, phone, cart, finalPrice }) {
  const normalizedPhone = phone
    .replace(/[\s-]/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "62")
    .slice(0, 13);

  const res = await fetch(`${NETLIFY_FUNC}/save-pending-order`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId:        applicationOrderId,
      orderPayload:   orderPayload,
      customerPhone:  normalizedPhone,
      customerName:   name,
      grossAmount:    finalPrice,
      orderTimestamp: new Date().toISOString(),
      items: cart.map((e) => ({
        name: [e.itemName, e.mokaVariantName].filter(Boolean).join(" - "),
        qty:  e.qty,
      })),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `save-pending-order gagal: ${res.status}`);
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

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
        onlineFee      = 0,
        finalPrice     = Math.max(0, subtotal - discountAmount) + (onlineFee || 0),
      } = customerInfo;

      const orderPayload = buildMokaOrderPayload({
        applicationOrderId, name, phone, orderNote,
        discount, discountAmount, onlineFee, cart,
      });

      // ── KASUS KHUSUS: diskon 100% (finalPrice = 0) ───────────────────────────
      if (finalPrice <= 0) {
        const res = await fetch(`${NETLIFY_FUNC}/moka-checkout`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ order: orderPayload }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Order gratis gagal diproses");
        }
        return { success: true, order_id: applicationOrderId, free: true };
      }

      // ── 1. Simpan payload ke Blobs ───────────────────────────────────────────
      await savePendingOrder({ applicationOrderId, orderPayload, name, phone, cart, finalPrice });

      // ── 2. Midtrans token ────────────────────────────────────────────────────
      const midtransItems = [
        ...cart.map((e) => ({
          id:       String(e.mokaVariantId || e.mokaItemId || "item"),
          price:    round(e.unitPrice),
          quantity: e.qty,
          name:     [e.itemName, e.mokaVariantName].filter(Boolean).join(" - ").slice(0, 50),
        })),
        ...(discountAmount > 0 && discount
          ? [{ id: "DISCOUNT", price: -discountAmount, quantity: 1,
               name: (discount.description || `Diskon ${discount.code}`).slice(0, 50) }]
          : []),
        ...(onlineFee > 0
          ? [{ id: "ONLINE_FEE", price: onlineFee, quantity: 1, name: "Biaya Online Order" }]
          : []),
      ];

      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount:   round(finalPrice),
        customer: { name, phone },
        items:    midtransItems,
      });

      // ── 3. Load Snap.js ──────────────────────────────────────────────────────
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("VITE_MIDTRANS_CLIENT_KEY tidak ditemukan.");
      await loadSnapScript(clientKey);

      // ── 4. Buka SNAP ─────────────────────────────────────────────────────────
      return new Promise((resolve, reject) => {
        window.snap.pay(token, {
          onSuccess: () => resolve({ success: true, order_id: applicationOrderId }),
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