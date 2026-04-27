// src/hooks/useMokaCheckout.js
// NEW ARCHITECTURE:
//   Paid:  save Blobs → Midtrans SNAP → midtrans-notify → Moka
//   Free:  save Blobs → moka-checkout → Moka (langsung, skip Midtrans)
//
// Order TIDAK masuk Moka sebelum customer bayar.

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder, savePendingOrder } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);
const ONLINE_ORDER_SALES_TYPE_ID = 602868;
const NOTIF_BASE = "https://sectorseven.space/.netlify/functions";
const fmtRp = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_ENV === "production";
const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

const MOKA_CB_SECRET = import.meta.env.VITE_MOKA_WEBHOOK_SECRET || "";
const MOKA_CB_URL = MOKA_CB_SECRET
  ? `${NOTIF_BASE}/moka-callback?secret=${encodeURIComponent(MOKA_CB_SECRET)}`
  : `${NOTIF_BASE}/moka-callback`;

function randomSuffix() {
  const c = globalThis.crypto || window.crypto;
  const bytes = new Uint8Array(3);
  c.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadSnapScript(clientKey) {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.querySelector(`script[src="${SNAP_URL}"]`);
    if (existing) { existing.addEventListener("load", resolve); return; }
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", clientKey);
    script.onload = resolve;
    script.onerror = () => reject(new Error("Gagal memuat Midtrans SNAP."));
    document.head.appendChild(script);
  });
}

function assertCartValid(cart) {
  const bad = cart.filter((e) => !e.mokaItemId);
  if (bad.length > 0) {
    throw new Error(`item_id null untuk: ${bad.map((b) => b.itemName).join(", ")}. Refresh halaman.`);
  }
}

// ─── Build Moka order payload (tidak submit) ─────────────────────────────────
function buildOrderPayload(cart, {
  applicationOrderId, name, phone, orderNote,
  discount, discountAmount, onlineFee, finalPrice,
}) {
  const hasDiscount = discountAmount > 0 && discount?.mokaId;

  const order_items = cart.map((entry) => {
    const modifierSum = (entry.mokaModifiers ?? []).reduce(
      (s, m) => s + round(m.modifier_option_price ?? 0), 0
    );
    const item = {
      item_id: entry.mokaItemId,
      item_name: entry.itemName,
      quantity: entry.qty,
      item_variant_id: entry.mokaVariantId,
      item_variant_name: entry.mokaVariantName || "Regular",
      item_price_library: round(entry.unitPrice) - modifierSum,
      category_id: entry.mokaCategoryId,
      category_name: entry.mokaCategoryName || "",
      note: "",
    };
    if (entry.mokaModifiers?.length) {
      item.item_modifiers = entry.mokaModifiers.map((mod) => ({
        item_modifier_id: mod.modifier_id,
        item_modifier_name: mod.modifier_name,
        item_modifier_option_id: mod.modifier_option_id,
        item_modifier_option_name: mod.modifier_option_name,
        item_modifier_option_price: round(mod.modifier_option_price ?? 0),
      }));
    }
    return item;
  });

  const discountFields = hasDiscount
    ? {
        discount_id: discount.mokaId,
        discount_name: discount.mokaName || discount.code,
        discount_type: discount.mokaType || (discount.type === "percentage" ? "percentage" : "cash"),
        discount_amount: discount.value,
        ...(discount.mokaGuid ? { discount_guid: discount.mokaGuid } : {}),
      }
    : {};

  const phoneClean = phone.replace(/\s|-|\+/g, "").replace(/^0/, "62").slice(0, 13);

  return {
    application_order_id: applicationOrderId,
    payment_type: "online_orders",
    client_created_at: new Date().toISOString(),
    note: [orderNote, `Total ${fmtRp(finalPrice)}`].filter(Boolean).join(" | ").slice(0, 255),
    customer_name: name.trim().slice(0, 50),
    customer_phone_number: phoneClean,
    sales_type_id: ONLINE_ORDER_SALES_TYPE_ID,
    sales_type_name: "Online Order",
    accept_order_notification_url:   MOKA_CB_URL,
    complete_order_notification_url: MOKA_CB_URL,
    cancel_order_notification_url:   MOKA_CB_URL,
    ...discountFields,
    order_items,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  const checkout = useCallback(async (cart, customerInfo = {}) => {
    if (!cart.length) throw new Error("Keranjang kosong");
    assertCartValid(cart);
    setSubmitting(true);

    try {
      const applicationOrderId = `S7-${Date.now()}-${randomSuffix()}`;
      const {
        name = "Customer", phone = "", orderNote = "",
        discount = null, onlineFee = 0,
      } = customerInfo;

      const discountAmount = discount?.discountAmount || customerInfo.discountAmount || 0;
      const subtotal = cart.reduce((s, e) => s + round(e.unitPrice * e.qty), 0);
      const finalPrice = customerInfo.finalPrice ?? Math.max(0, subtotal - discountAmount) + onlineFee;

      const orderPayload = buildOrderPayload(cart, {
        applicationOrderId, name, phone, orderNote,
        discount, discountAmount, onlineFee, finalPrice,
      });

      const blobsData = {
        orderId:         applicationOrderId,
        orderPayload,
        clientFinalPrice: finalPrice,
        customerPhone:   orderPayload.customer_phone_number,
        customerName:    orderPayload.customer_name,
        items: cart.map((e) => ({ name: e.itemName, qty: e.qty })),
      };

      // ── FREE ORDER: langsung ke Moka ────────────────────────────────────
      if (finalPrice <= 0) {
        await savePendingOrder(blobsData);
        await submitOrder(orderPayload, {
          final_price: finalPrice,
          price_context: {
            isFreeOrder: true, subtotal,
            discountCode: discount?.code || null,
            discountAmount, onlineFee, finalPrice,
          },
        });
        return { success: true, order_id: applicationOrderId, free: true };
      }

      // ── PAID ORDER: simpan Blobs → Midtrans SNAP ───────────────────────
      // Order BELUM masuk Moka. Baru masuk setelah midtrans-notify (settlement).
      await savePendingOrder(blobsData);

      const midtransItems = [
        ...cart.map((e) => ({
          id: String(e.mokaVariantId || e.mokaItemId),
          price: round(e.unitPrice),
          quantity: e.qty,
          name: [e.itemName, e.mokaVariantName].filter(Boolean).join(" - ").slice(0, 50),
        })),
        ...(discountAmount > 0 && discount ? [{
          id: "DISCOUNT", price: -discountAmount, quantity: 1,
          name: (discount.description || `Diskon ${discount.code}`).slice(0, 50),
        }] : []),
        ...(onlineFee > 0 ? [{
          id: "ONLINE_FEE", price: onlineFee, quantity: 1, name: "Biaya Online Order",
        }] : []),
      ];

      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount: finalPrice,
        customer: { name, phone },
        items: midtransItems,
      });

      await loadSnapScript(import.meta.env.VITE_MIDTRANS_CLIENT_KEY);

      return new Promise((resolve, reject) => {
        window.snap.pay(token, {
          onSuccess: (r) => resolve({ success: true, order_id: applicationOrderId, result: r }),
          onPending: (r) => resolve({ success: true, pending: true, order_id: applicationOrderId, result: r }),
          onError:   (e) => reject(new Error(e?.status_message || "Pembayaran gagal")),
          onClose:   ()  => reject(new Error("Pembayaran dibatalkan")),
        });
      });
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}