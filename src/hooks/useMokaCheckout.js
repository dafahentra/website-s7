// src/hooks/useMokaCheckout.js
// Midtrans SNAP payment → on success → Moka Advanced Order

import { useState, useCallback } from "react";
import { getMidtransToken, submitOrder } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_ENV === "production";
const SNAP_URL      = IS_PRODUCTION
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

  /**
   * checkout(cart, customerInfo)
   *
   * customerInfo shape (dari CartSidebar):
   *   { name, phone, orderNote, discount, subtotal, discountAmount, onlineFee, finalPrice }
   *
   * discount shape (dari validate-discount):
   *   { valid, code, mokaId, mokaGuid, mokaName, mokaType, value, discountAmount, description }
   */
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
        finalPrice     = subtotal - discountAmount + onlineFee,
      } = customerInfo;

      // ── Item list untuk Midtrans ────────────────────────────────────────────
      const midtransItems = cart.map((entry) => ({
        id:       String(entry.mokaVariantId || entry.mokaItemId || "item"),
        price:    round(entry.unitPrice),
        quantity: entry.qty,
        name:     [entry.itemName, entry.mokaVariantName].filter(Boolean).join(" - ").slice(0, 50),
      }));

      if (discountAmount > 0 && discount) {
        midtransItems.push({
          id:       "DISCOUNT",
          price:    -discountAmount,
          quantity: 1,
          name:     (discount.description || `Diskon ${discount.code}`).slice(0, 50),
        });
      }

      if (onlineFee > 0) {
        midtransItems.push({
          id:       "ONLINE_FEE",
          price:    onlineFee,
          quantity: 1,
          name:     "Online Fee",
        });
      }

      // ── 1. Buat Midtrans token ──────────────────────────────────────────────
      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount:   round(finalPrice),
        customer: { name, phone },
        items:    midtransItems,
      });

      // ── 2. Load Snap.js ─────────────────────────────────────────────────────
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("VITE_MIDTRANS_CLIENT_KEY tidak ditemukan.");
      await loadSnapScript(clientKey);

      // ── 3. Buka popup & tunggu hasil ────────────────────────────────────────
      return new Promise((resolve, reject) => {
        window.snap.pay(token, {

          onSuccess: async (result) => {
            console.log("[checkout] Midtrans success:", result.order_id);

            try {
              // Build Moka order items — harga tetap original (Moka hitung diskon sendiri)
              const order_items = cart.map((entry) => {
                const item = {
                  item_id:            entry.mokaItemId,
                  item_name:          entry.itemName,
                  quantity:           entry.qty,
                  item_variant_id:    entry.mokaVariantId,
                  item_variant_name:  entry.mokaVariantName || "Regular",
                  item_price_library: round(entry.unitPrice),
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

              // Note Moka: singkat, hanya fee & total bayar (diskon sudah tercatat di field native)
              const fmtRp = (n) => `Rp${new Intl.NumberFormat("id-ID").format(n)}`;
              const noteParts = [
                orderNote || "",
                onlineFee > 0 ? `Biaya online +${fmtRp(onlineFee)}` : "",
                `Total dibayar ${fmtRp(finalPrice)}`,
              ].filter(Boolean).join(" | ");

              // Discount fields native Moka — inilah yang membuat diskon tampil
              // di receipt Moka dan bisa di-refund lewat sistem Moka
              const discountFields = (discountAmount > 0 && discount) ? {
                discount_id:     discount.mokaId     || undefined,
                discount_guid:   discount.mokaGuid   || undefined,
                discount_name:   discount.mokaName   || discount.code,
                // mokaType: "cash" | "percentage" — langsung dari Moka discounts API
                discount_type:   discount.mokaType   || (discount.type === "percentage" ? "percentage" : "cash"),
                // value = angka mentah dari Moka: 10 untuk 10%, 5000 untuk flat Rp5.000
                discount_amount: discount.value,
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
              console.error("[checkout] Moka order gagal setelah pembayaran:", mokaErr.message);
              resolve({ success: true, order_id: applicationOrderId, mokaError: mokaErr.message });
            }
          },

          onPending: () => {
            resolve({ success: false, pending: true, order_id: applicationOrderId });
          },

          onError: () => {
            reject(new Error("Pembayaran gagal. Silakan coba lagi."));
          },

          onClose: () => {
            reject(new Error("Pembayaran dibatalkan."));
          },
        });
      });

    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}