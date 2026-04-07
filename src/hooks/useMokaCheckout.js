// src/hooks/useMokaCheckout.js
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
    if (existing) { existing.onload = resolve; return; }

    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", clientKey);
    script.onload  = resolve;
    script.onerror = () => reject(new Error("Gagal memuat Midtrans SNAP. Cek koneksi internet."));
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
      const totalAmount = cart.reduce((s, e) => s + round(e.unitPrice * e.qty), 0);

      // Item detail untuk Midtrans (max 50 karakter per nama)
      const midtransItems = cart.map((entry) => ({
        id:       String(entry.mokaVariantId || entry.mokaItemId),
        price:    round(entry.unitPrice),
        quantity: entry.qty,
        name:     [entry.itemName, entry.mokaVariantName]
          .filter(Boolean).join(" - ").slice(0, 50),
      }));

      // 1. Buat Midtrans token
      const { token } = await getMidtransToken({
        order_id: applicationOrderId,
        amount:   totalAmount,
        customer: {
          name:  customerInfo.name  || "Customer",
          phone: customerInfo.phone || "",
        },
        items: midtransItems,
      });

      // 2. Load Snap.js
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("VITE_MIDTRANS_CLIENT_KEY tidak ditemukan di .env");
      await loadSnapScript(clientKey);

      // 3. Buka popup Midtrans
      return new Promise((resolve, reject) => {
        window.snap.pay(token, {
          onSuccess: async (result) => {
            console.log("[checkout] Midtrans success:", result.order_id);

            try {
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

              // note Moka = hanya catatan dari customer, bersih tanpa prefix
              const mokaNote = customerInfo.orderNote
                ? customerInfo.orderNote.slice(0, 255)
                : "";

              await submitOrder({
                application_order_id:  applicationOrderId,
                payment_type:          "online_orders",
                client_created_at:     new Date().toISOString(),
                note:                  mokaNote,
                customer_name:         customerInfo.name  || "",
                customer_phone_number: customerInfo.phone || "",
                order_items,
              });

              resolve({ success: true, order_id: applicationOrderId });
            } catch (mokaErr) {
              // Payment sudah sukses — tetap resolve meski Moka gagal
              console.error("[checkout] Moka order failed after payment:", mokaErr.message);
              resolve({ success: true, order_id: applicationOrderId, mokaError: mokaErr.message });
            }
          },

          onPending: (result) => {
            console.log("[checkout] Midtrans pending:", result);
            resolve({ success: false, pending: true, order_id: applicationOrderId });
          },

          onError: (result) => {
            console.error("[checkout] Midtrans error:", result);
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