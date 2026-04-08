// src/utils/onlineFee.js
// Fee online order — dikenakan ke customer untuk menutup biaya payment gateway.
// Ubah nilai di sini untuk mengubah threshold dan nilai fee.

export const ONLINE_FEE_RULES = [
  { maxAmount: 49999, fee: 500  },   // order < Rp50.000 → fee Rp500
  { maxAmount: Infinity, fee: 1000 }, // order ≥ Rp50.000 → fee Rp1.000
];

/**
 * Hitung fee berdasarkan total setelah diskon.
 * @param {number} amountAfterDiscount  - total setelah diskon, sebelum fee
 * @returns {number} fee dalam rupiah
 */
export function calcOnlineFee(amountAfterDiscount) {
  const rule = ONLINE_FEE_RULES.find((r) => amountAfterDiscount <= r.maxAmount);
  return rule ? rule.fee : 0;
}