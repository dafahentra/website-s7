// src/hooks/useMokaCheckout.js
// Builds Moka CheckoutApi payload and submits via Netlify proxy.

import { useState, useCallback } from "react";
import { submitCheckout } from "../services/mokaApi";

export function useMokaCheckout() {
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);

  /**
   * cart entries must include:
   * { itemName, mokaItemId, mokaVariantId, mokaVariantName, mokaVariantSku,
   *   mokaCategoryId, mokaCategoryName, mokaModifiers, qty, unitPrice }
   */
  const checkout = useCallback(async (cart, paymentNote = "Online Order") => {
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const now = new Date().toISOString();

      const items = cart.map((entry) => {
        const grossSales = entry.unitPrice * entry.qty;
        return {
          quantity:          entry.qty,
          item_id:           entry.mokaItemId,
          item_name:         entry.itemName,
          item_variant_id:   entry.mokaVariantId,
          item_variant_name: entry.mokaVariantName  ?? "",
          item_variant_sku:  entry.mokaVariantSku   ?? "",
          category_id:       entry.mokaCategoryId,
          category_name:     entry.mokaCategoryName ?? "",
          client_price:      entry.unitPrice,
          gross_sales:       grossSales,
          net_sales:         grossSales,
          modifiers: (entry.mokaModifiers ?? []).map((m) => ({
            modifier_id:           m.modifier_id,
            modifier_option_id:    m.modifier_option_id,
            modifier_name:         m.modifier_name,
            modifier_option_name:  m.modifier_option_name,
            modifier_option_price: m.modifier_option_price,
            gross_sales:           (m.modifier_option_price ?? 0) * entry.qty,
            net_sales:             (m.modifier_option_price ?? 0) * entry.qty,
            discount_amount:       0,
            redeem_amount:         0,
          })),
        };
      });

      const totalGross = items.reduce((s, i) => s + i.gross_sales, 0);

      const payload = {
        note:                    paymentNote,
        client_created_at:       now,
        total_gross_sales:       totalGross,
        total_net_sales:         totalGross,
        total_collected:         totalGross,
        amount_pay:              totalGross,
        include_tax_and_gratuity: false,
        enable_tax:              false,
        enable_gratuity:         false,
        items,
      };

      const res = await submitCheckout(payload);
      setResult(res);
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting, result, error };
}