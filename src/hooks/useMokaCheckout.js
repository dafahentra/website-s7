// src/hooks/useMokaCheckout.js
// Payload sesuai CheckoutApi spec dari api-docs-prod-2.json

import { useState, useCallback } from "react";
import { submitCheckout } from "../services/mokaApi";

const round = (n) => Math.round(Number(n) || 0);

export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);

  const checkout = useCallback(async (cart, note = "Online Order") => {
    if (!cart.length) throw new Error("Keranjang kosong");

    setSubmitting(true);

    try {
      const items = cart.map((entry) => {
        const item = {
          // Required fields per CheckoutApiItem spec
          quantity:          entry.qty,                          // integer
          item_id:           entry.mokaItemId,                   // integer
          item_name:         entry.itemName,                     // string, required
          item_variant_id:   entry.mokaVariantId,                // integer, required
          item_variant_name: entry.mokaVariantName || "Regular", // string, required
          item_variant_sku:  entry.mokaVariantSku  || "",        // string, optional
          category_id:       entry.mokaCategoryId,               // integer, required
          category_name:     entry.mokaCategoryName || "",       // string, required
          client_price:      round(entry.unitPrice),             // integer
          gross_sales:       round(entry.unitPrice * entry.qty), // integer, required
          net_sales:         round(entry.unitPrice * entry.qty), // integer, required
        };

        if (entry.mokaModifiers?.length) {
          item.modifiers = entry.mokaModifiers.map((mod) => ({
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
        // Required fields per CheckoutApi spec — semua integer/number/boolean sesuai tipe
        note,                                        // string, required
        client_created_at:        new Date().toISOString(), // string, required
        total_gross_sales:        totalGross,        // integer, required
        total_discount:           0,                 // integer, optional
        total_gratuity:           0,                 // integer, optional
        total_tax:                0,                 // integer, optional
        total_net_sales:          totalGross,        // integer, required
        total_collected:          totalGross,        // number, required
        amount_pay:               totalGross,        // number, required
        include_tax_and_gratuity: false,             // boolean, optional
        enable_tax:               false,             // boolean, optional
        enable_gratuity:          false,             // boolean, optional
        items,
      });
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting };
}