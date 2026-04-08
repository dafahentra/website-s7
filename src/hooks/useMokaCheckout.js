// src/hooks/useMokaCheckout.js
// Midtrans SNAP payment → on success → Moka Advanced Order

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);
const fmtRp = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;

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
        finalPrice     = subtotal - discountAmount,
      } = customerInfo;

      const hasDiscount = discountAmount > 0 && discount?.mokaId;

      // ── Midtrans item list ───────────────────────────────────────────────────
      const midtransItems = [
        ...cart.map((e) => ({
          id:       String(e.mokaVariantId || e.mokaItemId || "item"),
          price:    round(e.unitPrice),   // unitPrice sudah include modifier, benar untuk Midtrans
          quantity: e.qty,
          name:     [e.itemName, e.mokaVariantName].filter(Boolean).join(" - ").slice(0, 50),
        })),
        ...(hasDiscount ? [{
          id:       "DISCOUNT",
          price:    -discountAmount,
          quantity: 1,
          name:     (discount.description || `Diskon ${discount.code}`).slice(0, 50),
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

      // ── 3. Buka popup ────────────────────────────────────────────────────────
      return new Promise((resolve, reject) => {
        window.snap.pay(token, {

          onSuccess: async () => {
            try {
              const order_items = cart.map((entry) => {
                // ── FIX: item_price_library = harga DASAR saja (tanpa modifier) ──
                // Moka menambah modifier price sendiri dari item_modifiers.
                // Kalau kita kirim unitPrice (sudah include modifier), Moka hitung 2x.
                const modifierSum = (entry.mokaModifiers ?? [])
                  .reduce((s, m) => s + round(m.modifier_option_price ?? 0), 0);
                const basePrice = round(entry.unitPrice) - modifierSum;

                const item = {
                  item_id:            entry.mokaItemId,
                  item_name:          entry.itemName,
                  quantity:           entry.qty,
                  item_variant_id:    entry.mokaVariantId,
                  item_variant_name:  entry.mokaVariantName || "Regular",
                  item_price_library: basePrice,   // ← harga dasar, bukan unitPrice
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

              // Note: catatan customer + total (diskon tercatat via discount_* fields)
              const noteParts = [
                orderNote,
                `Total ${fmtRp(finalPrice)}`,
              ].filter(Boolean).join(" | ");

              // Diskon native Moka
              const discountFields = hasDiscount ? {
                discount_id:     discount.mokaId,
                discount_name:   discount.mokaName  || discount.code,
                discount_type:   discount.mokaType  || (discount.type === "percentage" ? "percentage" : "cash"),
                discount_amount: discount.value,
                ...(discount.mokaGuid ? { discount_guid: discount.mokaGuid } : {}),
              } : {};

              await submitOrder({
                application_order_id:  applicationOrderId,
                payment_type:          "online_orders",
                client_created_at:     new Date().toISOString(),
                note:                  noteParts.slice(0, 255),
                customer_name:         name,
                customer_phone_number: phone,
                ...discountFields,
                order_items,
              });

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