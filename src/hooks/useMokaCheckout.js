// src/hooks/useMokaCheckout.js
// Sends cart to Moka via mokaApi service layer.
// Builds the CheckoutApi payload from cart entries.

import { useState, useCallback } from "react";
import { submitCheckout } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  /**
   * checkout(cart, note)
   * @param {Array}  cart - cart entries from index.jsx state
   * @param {string} note - payment / order note
   */
  const checkout = useCallback(async (cart, note = "Online Order") => {
    if (!cart.length) throw new Error("Keranjang kosong");

    setSubmitting(true);

    try {
      const checkoutItems = cart.map((entry) => {
        const item = {
          quantity:          entry.qty,
          item_id:           entry.mokaItemId,
          item_name:         entry.itemName,
          item_variant_id:   entry.mokaVariantId,
          item_variant_name: entry.mokaVariantName || "Regular",
          item_variant_sku:  entry.mokaVariantSku  || "",
          category_id:       entry.mokaCategoryId,
          category_name:     entry.mokaCategoryName || "",
          client_price:      round(entry.unitPrice),
          gross_sales:       round(entry.unitPrice * entry.qty),
          net_sales:         round(entry.unitPrice * entry.qty),
        };

        if (entry.mokaModifiers?.length) {
          item.checkout_item_modifiers = entry.mokaModifiers.map((mod) => ({
            modifier_id:           mod.modifier_id,
            modifier_option_id:    mod.modifier_option_id,
            modifier_name:         mod.modifier_name,
            modifier_option_name:  mod.modifier_option_name,
            modifier_option_price: round(mod.modifier_option_price ?? 0),
          }));
        }

        return item;
      });

      const totalGross = cart.reduce((s, e) => s + round(e.unitPrice * e.qty), 0);

      return await submitCheckout({
        note,
        client_created_at:        new Date().toISOString(),
        total_gross_sales:        totalGross,
        total_discount:           0,
        total_gratuity:           0,
        total_tax:                0,
        total_net_sales:          totalGross,
        total_collected:          totalGross,
        include_tax_and_gratuity: false,
        enable_tax:               false,
        enable_gratuity:          false,
        payment_type:             "cash",
        checkout_items:           checkoutItems,
      });
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}