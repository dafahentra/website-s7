// src/hooks/useMokaCheckout.js
// Flow: submit order ke Moka DULU → buka Midtrans SNAP → redirect handler.
//
// Perubahan utama vs versi lama:
// 1. Validator `assertCartValid()` — fail fast kalau ada item_id null.
// 2. `applicationOrderId` pakai random suffix (tidak predictable).
// 3. Destructure customerInfo dibersihkan dari variabel yang tidak dipakai.

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

// Sales type ID untuk "Online Order" di Moka.
// Didapat dari: GET /v1/outlets/{outlet_id}/sales_type (cari name "Online Order")
const ONLINE_ORDER_SALES_TYPE_ID = 602868;

const NOTIF_BASE = "https://sectorseven.space/.netlify/functions";
const fmtRp = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_ENV === "production";
const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

// ─── Random suffix untuk application_order_id ────────────────────────────────
// Tidak pakai Date.now() saja karena predictable → retry token bisa di-brute force.
// 6 hex char = 16 juta kombinasi, cukup untuk cegah guessing dalam rentang 1 detik.
function randomSuffix() {
  const c = globalThis.crypto || window.crypto;
  const bytes = new Uint8Array(3);
  c.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Load Midtrans SNAP script ───────────────────────────────────────────────
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

// ─── Ringkasan item untuk WhatsApp notif ─────────────────────────────────────
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

// ─── VALIDATOR ───────────────────────────────────────────────────────────────
// Fail fast kalau ada cart entry tanpa mokaItemId.
// Pesan error jelas agar user tahu item mana yang bermasalah.
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
async function sendMokaOrder(cart, {
  applicationOrderId,
  name,
  phone,
  orderNote,
  discount,
  discountAmount,
  onlineFee,
  finalPrice,
}) {
  assertCartValid(cart);

  const hasDiscount = discountAmount > 0 && discount?.mokaId;

  const order_items = cart.map((entry) => {
    // item_price_library = harga DASAR (tanpa modifier)
    // Moka menambah modifier price sendiri dari item_modifiers
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

  // Diskon native Moka
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

  // Note singkat untuk kasir (max 255 char per docs Moka)
  const note = [orderNote, `Total ${fmtRp(finalPrice)}`]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 255);

  // Moka limits: customer_name max 50 chars, phone max 13 digits
  const phoneClean = phone
    .replace(/\s|-|\+/g, "")
    .replace(/^0/, "62")
    .slice(0, 13);
  const nameClean = name.trim().slice(0, 50);

  await submitOrder({
    application_order_id: applicationOrderId,
    payment_type: "online_orders",
    client_created_at: new Date().toISOString(),
    note,
    customer_name: nameClean,
    customer_phone_number: phoneClean,
    sales_type_id: ONLINE_ORDER_SALES_TYPE_ID,
    sales_type_name: "Online Order",
    accept_order_notification_url: `${NOTIF_BASE}/order-notify?event=accepted&order=${applicationOrderId}&phone=${encodeURIComponent(
      phone
    )}&name=${encodeURIComponent(name)}&total=${finalPrice}&items=${encodeURIComponent(
      buildItemsSummary(cart)
    )}`,
    complete_order_notification_url: `${NOTIF_BASE}/order-notify?event=completed&order=${applicationOrderId}&phone=${encodeURIComponent(
      phone
    )}&name=${encodeURIComponent(name)}&total=${finalPrice}&items=${encodeURIComponent(
      buildItemsSummary(cart)
    )}`,
    cancel_order_notification_url: `${NOTIF_BASE}/order-notify?event=cancelled&order=${applicationOrderId}&phone=${encodeURIComponent(
      phone
    )}&name=${encodeURIComponent(name)}`,
    ...discountFields,
    order_items,
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  const checkout = useCallback(async (cart, customerInfo = {}) => {
    if (!cart.length) throw new Error("Keranjang kosong");

    // Fail fast sebelum setSubmitting(true) → tombol tidak stuck loading
    assertCartValid(cart);

    setSubmitting(true);

    try {
      // Order ID: prefix + timestamp + 6 hex random → tidak bisa ditebak
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

      // ── KASUS KHUSUS: diskon 100% (finalPrice = 0) ──────────────────────
      // Midtrans menolak amount = 0, jadi langsung submit ke Moka tanpa payment
      if (finalPrice <= 0) {
        try {
          await sendMokaOrder(cart, mokaPayload);
          return { success: true, order_id: applicationOrderId, free: true };
        } catch (err) {
          throw new Error(`Order gagal: ${err.message}`);
        }
      }

      // ── Midtrans item list ──────────────────────────────────────────────
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

      // ── 1. Submit order ke Moka DULU (sebelum buka SNAP) ────────────────
      // Penting: save-pending-order harus selesai sebelum customer bayar,
      // supaya midtrans-notify bisa baca customerPhone dari Blobs saat settlement.
      await sendMokaOrder(cart, mokaPayload);

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