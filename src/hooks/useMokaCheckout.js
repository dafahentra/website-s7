// src/hooks/useMokaCheckout.js
// Sends cart to Moka via the moka-checkout Netlify function.
// Builds the CheckoutApi payload from cart entries.

import { useState, useCallback } from "react";

const fmt = (n) => Math.round(Number(n) || 0);

export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  /**
   * checkout(cart, note)
   * @param {Array}  cart  - array of cart entries from index.jsx state
   * @param {string} note  - payment note / order note
   */
  const checkout = useCallback(async (cart, note = "Online Order") => {
    if (!cart.length) throw new Error("Keranjang kosong");

    setSubmitting(true);

    try {
      // Build checkout items
      const checkoutItems = cart.map((entry) => {
        const itemObj = {
          quantity:          entry.qty,
          item_id:           entry.mokaItemId,
          item_name:         entry.itemName,
          item_variant_id:   entry.mokaVariantId,
          item_variant_name: entry.mokaVariantName || "Regular",
          item_variant_sku:  entry.mokaVariantSku  || "",
          category_id:       entry.mokaCategoryId,
          category_name:     entry.mokaCategoryName || "",
          client_price:      fmt(entry.unitPrice),
          gross_sales:       fmt(entry.unitPrice * entry.qty),
          net_sales:         fmt(entry.unitPrice * entry.qty),
        };

        // Add modifiers if any
        if (entry.mokaModifiers?.length) {
          itemObj.checkout_item_modifiers = entry.mokaModifiers.map((mod) => ({
            modifier_id:           mod.modifier_id,
            modifier_option_id:    mod.modifier_option_id,
            modifier_name:         mod.modifier_name,
            modifier_option_name:  mod.modifier_option_name,
            modifier_option_price: fmt(mod.modifier_option_price ?? 0),
          }));
        }

        return itemObj;
      });

      // Calculate totals
      const totalGross = cart.reduce((s, e) => s + fmt(e.unitPrice * e.qty), 0);

      const payload = {
        checkout: {
          note,
          client_created_at: new Date().toISOString(),
          total_gross_sales:  totalGross,
          total_discount:     0,
          total_gratuity:     0,
          total_tax:          0,
          total_net_sales:    totalGross,
          total_collected:    totalGross,
          include_tax_and_gratuity: false,
          enable_tax:         false,
          enable_gratuity:    false,
          payment_type:       "cash",
          checkout_items:     checkoutItems,
        },
      };

      const res = await fetch("/.netlify/functions/moka-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.meta?.error_message ||
          data?.error              ||
          `Checkout gagal: HTTP ${res.status}`
        );
      }

      return data;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}