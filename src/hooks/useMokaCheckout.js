// src/hooks/useMokaCheckout.js
// Flow: submit order ke Moka DULU → buka Midtrans SNAP → redirect handler.
//
// Perubahan:
// 1. Callback URL → moka-callback.js (fix bug utama).
// 2. Secret via VITE_MOKA_WEBHOOK_SECRET.
// 3. Query param phone/name dihapus — moka-callback baca dari Blobs.
// 4. [SECURITY] Free order kirim price_context → server validasi ulang.
// 5. [FIX] final_price SELALU dikirim ke server → disimpan di Blobs.
//    Mencegah race condition: Moka callback fire sebelum midtrans-notify
//    → grossAmount null → refund gagal.

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder } from "../services/mokaApi";

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
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadSnapScript(clientKey) {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.querySelector(`script[src="${SNAP_URL}"]`);
    if (existing) {
      existing.addEventListener("load", resolve);
      return;
    }
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", clientKey);
    script.onload = resolve;
    script.onerror = () => reject(new Error("Gagal memuat Midtrans SNAP."));
    document.head.appendChild(script);
  });
}

function buildItemsSummary(cart) {
  return cart
    .map((e) => {
      const mods = (e.mokaModifiers ?? [])
        .filter((m) => m.modifier_option_name)
        .map((m) => m.modifier_option_name)
        .join(", ");
      const line = `${e.qty}x ${e.itemName}${
        e.mokaVariantName && e.mokaVariantName !== "Regular"
          ? ` (${e.mokaVariantName})`
          : ""
      }`;
      return mods ? `${line} - ${mods}` : line;
    })
    .join("|");
}

function assertCartValid(cart) {
  const bad = cart.filter((e) => !e.mokaItemId);
  if (bad.length > 0) {
    const names = bad.map((b) => b.itemName).join(", ");
    throw new Error(
      `item_id null untuk: ${names}. Refresh halaman dan coba lagi.`
    );
  }
}

// ─── Bangun payload & submit ke Moka ─────────────────────────────────────────
// serverExtra: { final_price, price_context? } — diteruskan ke moka-checkout.
async function sendMokaOrder(cart, mokaPayload, serverExtra = null) {
  assertCartValid(cart);

  const {
    applicationOrderId, name, phone, orderNote,
    discount, discountAmount, onlineFee, finalPrice,
  } = mokaPayload;

  const hasDiscount = discountAmount > 0 && discount?.mokaId;

  const order_items = cart.map((entry) => {
    const modifierSum = (entry.mokaModifiers ?? []).reduce(
      (s, m) => s + round(m.modifier_option_price ?? 0),
      0
    );
    const basePrice = round(entry.unitPrice) - modifierSum;

    const item = {
      item_id: entry.mokaItemId,
      item_name: entry.itemName,
      quantity: entry.qty,
      item_variant_id: entry.mokaVariantId,
      item_variant_name: entry.mokaVariantName || "Regular",
      item_price_library: basePrice,
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
        discount_type:
          discount.mokaType ||
          (discount.type === "percentage" ? "percentage" : "cash"),
        discount_amount: discount.value,
        ...(discount.mokaGuid ? { discount_guid: discount.mokaGuid } : {}),
      }
    : {};

  const note = [orderNote, `Total ${fmtRp(finalPrice)}`]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 255);

  const phoneClean = phone
    .replace(/\s|-|\+/g, "")
    .replace(/^0/, "62")
    .slice(0, 13);
  const nameClean = name.trim().slice(0, 50);

  const orderPayload = {
    application_order_id: applicationOrderId,
    payment_type: "online_orders",
    client_created_at: new Date().toISOString(),
    note,
    customer_name: nameClean,
    customer_phone_number: phoneClean,
    sales_type_id: ONLINE_ORDER_SALES_TYPE_ID,
    sales_type_name: "Online Order",
    accept_order_notification_url:   MOKA_CB_URL,
    complete_order_notification_url: MOKA_CB_URL,
    cancel_order_notification_url:   MOKA_CB_URL,
    ...discountFields,
    order_items,
  };

  await submitOrder(orderPayload, serverExtra);
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
        name = "Customer",
        phone = "",
        orderNote = "",
        discount = null,
        onlineFee = 0,
      } = customerInfo;

      const discountAmount = discount?.discountAmount || customerInfo.discountAmount || 0;
      const subtotal = cart.reduce((s, e) => s + round(e.unitPrice * e.qty), 0);
      const finalPrice =
        customerInfo.finalPrice ??
        Math.max(0, subtotal - discountAmount) + onlineFee;

      const mokaPayload = {
        applicationOrderId,
        name,
        phone,
        orderNote,
        discount,
        discountAmount,
        onlineFee,
        finalPrice,
      };

      // ── KASUS KHUSUS: finalPrice ≤ 0 (free order) ──────────────────────
      if (finalPrice <= 0) {
        const serverExtra = {
          final_price: finalPrice,
          price_context: {
            isFreeOrder:    true,
            subtotal,
            discountCode:   discount?.code || null,
            discountAmount,
            onlineFee,
            finalPrice,
          },
        };

        try {
          await sendMokaOrder(cart, mokaPayload, serverExtra);
          return { success: true, order_id: applicationOrderId, free: true };
        } catch (err) {
          throw new Error(`Order gagal: ${err.message}`);
        }
      }

      // ── Paid order: selalu kirim final_price ke server ──────────────────
      const serverExtra = { final_price: finalPrice };

      const midtransItems = [
        ...cart.map((e) => ({
          id: String(e.mokaVariantId || e.mokaItemId),
          price: round(e.unitPrice),
          quantity: e.qty,
          name: [e.itemName, e.mokaVariantName]
            .filter(Boolean)
            .join(" - ")
            .slice(0, 50),
        })),
        ...(discountAmount > 0 && discount
          ? [
              {
                id: "DISCOUNT",
                price: -discountAmount,
                quantity: 1,
                name: (
                  discount.description || `Diskon ${discount.code}`
                ).slice(0, 50),
              },
            ]
          : []),
        ...(onlineFee > 0
          ? [
              {
                id: "ONLINE_FEE",
                price: onlineFee,
                quantity: 1,
                name: "Biaya Online Order",
              },
            ]
          : []),
      ];

      // ── 1. Submit order ke Moka DULU ────────────────────────────────────
      await sendMokaOrder(cart, mokaPayload, serverExtra);

      // ── 2. Dapat token SNAP dari Midtrans ───────────────────────────────
      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount: finalPrice,
        customer: { name, phone },
        items: midtransItems,
      });

      // ── 3. Load SNAP & buka payment popup ───────────────────────────────
      await loadSnapScript(import.meta.env.VITE_MIDTRANS_CLIENT_KEY);

      return new Promise((resolve, reject) => {
        window.snap.pay(token, {
          onSuccess: (r) =>
            resolve({ success: true, order_id: applicationOrderId, result: r }),
          onPending: (r) =>
            resolve({
              success: true,
              pending: true,
              order_id: applicationOrderId,
              result: r,
            }),
          onError: (e) =>
            reject(new Error(e?.status_message || "Pembayaran gagal")),
          onClose: () => reject(new Error("Pembayaran dibatalkan")),
        });
      });
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}