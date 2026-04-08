// netlify/functions/discount-config.js
// Konfigurasi semua kode diskon — edit file ini untuk menambah/ubah/hapus promo
//
// Tipe diskon:
//   percentage  → potongan persen dari total (misal: 10 = 10%)
//   fixed       → potongan nominal tetap (misal: 5000 = Rp5.000)
//
// Limit:
//   dailyLimit  → maksimal berapa kali kode dipakai per hari (null = tidak terbatas)
//   totalLimit  → maksimal berapa kali kode dipakai seumur hidup (null = tidak terbatas)
//
// Periode:
//   startDate   → tanggal mulai berlaku (format: "YYYY-MM-DD"), null = langsung aktif
//   endDate     → tanggal berakhir (format: "YYYY-MM-DD"), null = tidak ada batas akhir
//
// minOrder:
//   Minimum total order agar kode bisa dipakai (0 = tidak ada minimum)

export const DISCOUNT_CODES = {

  // Contoh: diskon 10% untuk semua order, berlaku April 2026, limit 50x per hari
  "SEKTOR10": {
    type:       "percentage",
    value:      10,
    minOrder:   0,
    dailyLimit: 50,
    totalLimit: null,
    startDate:  "2026-04-01",
    endDate:    "2026-04-30",
    description: "Diskon 10% Online Order",
  },

  // Contoh: diskon flat Rp5.000 untuk order min Rp25.000, limit 20x per hari
  "HEMAT5K": {
    type:       "fixed",
    value:      5000,
    minOrder:   25000,
    dailyLimit: 20,
    totalLimit: null,
    startDate:  "2026-04-01",
    endDate:    "2026-05-31",
    description: "Potongan Rp5.000 min. order Rp25.000",
  },

  // Contoh: diskon 20% sekali pakai total (totalLimit: 1 per kode)
  "GRAND20": {
    type:       "percentage",
    value:      20,
    minOrder:   0,
    dailyLimit: null,
    totalLimit: 100,
    startDate:  "2026-04-08",
    endDate:    "2026-04-08",
    description: "Grand Opening 20% Off",
  },

};