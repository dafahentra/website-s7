// src/pages/Menu/AddToCartModal.jsx
// Pakai REAL item_variants dan active_modifiers dari Moka API.
//
// Perubahan utama:
// - Hard guard di handleConfirm: refuse kalau mokaItem.id null.
// - Tombol disabled saat loading / error / belum sinkron.
// - Banner warning kalau item belum tersinkron dengan POS.

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

const Chip = ({ label, sublabel, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
      active
        ? "bg-brand-navy text-white border-brand-navy"
        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
    }`}
  >
    {label}
    {sublabel && (
      <span className={`ml-1 ${active ? "text-white/70" : "text-gray-400"}`}>
        {sublabel}
      </span>
    )}
  </button>
);

const AddToCartModal = ({
  item,
  mokaItem,
  mokaLoading,
  mokaError,
  onClose,
  onConfirm,
}) => {
  // ── Variants ──────────────────────────────────────────────────────────────
  const variants = useMemo(
    () => mokaItem?.item_variants?.filter((v) => !v.is_deleted) ?? null,
    [mokaItem]
  );

  // ── Modifier groups ───────────────────────────────────────────────────────
  const modifierGroups = useMemo(
    () =>
      (mokaItem?.active_modifiers ?? [])
        .filter((m) => !m.is_deleted)
        .map((m) => ({
          id: m.id,
          name: m.name,
          min: m.min_no_of_options ?? 0,
          max: m.max_no_of_options ?? 1,
          options: (m.modifier_options ?? []).filter((o) => !o.is_deleted),
        })),
    [mokaItem]
  );

  // ── Initial state ─────────────────────────────────────────────────────────
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    if (!variants?.length) return null;
    const regular = variants.find((v) =>
      v.name?.toLowerCase().includes("regular")
    );
    return (regular ?? variants[0]).id;
  });
  const [selectedMods, setSelectedMods] = useState(() => {
    const init = {};
    modifierGroups.forEach((g) => {
      if (g.options.length > 0) {
        const normal = g.options.find((o) =>
          o.name?.toLowerCase().includes("normal")
        );
        init[g.id] = (normal ?? g.options[0]).id;
      }
    });
    return init;
  });
  const [qty, setQty] = useState(1);

  // ── Price calc ────────────────────────────────────────────────────────────
  const selectedVariant =
    variants?.find((v) => v.id === selectedVariantId) ?? variants?.[0];

  const basePrice = useMemo(() => {
    if (selectedVariant?.price) return selectedVariant.price;
    return parseInt(String(item.price).replace(/\./g, ""), 10) || 0;
  }, [selectedVariant, item.price]);

  const modifiersPrice = useMemo(
    () =>
      modifierGroups.reduce((sum, g) => {
        const opt = g.options.find((o) => o.id === selectedMods[g.id]);
        return sum + (opt?.price ?? 0);
      }, 0),
    [modifierGroups, selectedMods]
  );

  const unitPrice = basePrice + modifiersPrice;
  const totalPrice = unitPrice * qty;

  const buildMokaModifiers = () =>
    modifierGroups
      .map((g) => {
        const opt = g.options.find((o) => o.id === selectedMods[g.id]);
        if (!opt) return null;
        return {
          modifier_id: g.id,
          modifier_option_id: opt.id,
          modifier_name: g.name,
          modifier_option_name: opt.name,
          modifier_option_price: opt.price ?? 0,
        };
      })
      .filter(Boolean);

  // ── HARD GUARD ────────────────────────────────────────────────────────────
  const isSynced = !!mokaItem?.id;
  const canConfirm = !mokaLoading && !mokaError && isSynced;

  const handleConfirm = () => {
    if (!isSynced) {
      alert(
        "Menu ini belum tersinkron dengan POS. Refresh halaman dan coba lagi."
      );
      return;
    }

    onConfirm({
      item,
      itemName: item.name,
      mokaItemId: mokaItem.id,
      mokaVariantId: selectedVariant?.id ?? null,
      mokaVariantName: selectedVariant?.name ?? "",
      mokaVariantSku: selectedVariant?.sku ?? "",
      mokaCategoryId: mokaItem.category_id ?? null,
      mokaCategoryName: mokaItem.category?.name ?? "",
      mokaModifiers: buildMokaModifiers(),
      qty,
      unitPrice,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 56, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
      >
        {/* Hero */}
        <div
          className="relative flex items-center justify-center h-44 overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg,#0a1628 0%,#1e3a5f 60%,#0a1628 100%)",
          }}
        >
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={item.image}
            alt={item.name}
            className="h-36 w-36 object-cover rounded-2xl shadow-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 overflow-y-auto max-h-[60vh]">
          {/* Name + live price */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 mr-4">
              <h2 className="text-xl font-black text-brand-navy leading-tight">
                {item.name}
              </h2>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
            <motion.span
              key={unitPrice}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-brand-orange font-black text-lg whitespace-nowrap"
            >
              Rp{fmt(unitPrice)}
            </motion.span>
          </div>

          {/* Status sinkron POS */}
          {mokaLoading && (
            <div className="mb-4 p-2.5 rounded-xl bg-gray-50 text-gray-500 text-xs">
              Memuat data POS…
            </div>
          )}
          {mokaError && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
              Gagal muat data POS: {mokaError}
            </div>
          )}
          {!mokaLoading && !mokaError && !isSynced && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs">
              Item ini belum tersinkron dengan POS. Refresh halaman.
            </div>
          )}

          {/* Variants — from Moka item_variants */}
          {variants && variants.length > 1 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                Varian
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Chip
                    key={v.id}
                    label={v.name}
                    sublabel={v.price ? `Rp${fmt(v.price)}` : null}
                    active={v.id === selectedVariantId}
                    onClick={() => setSelectedVariantId(v.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Modifier groups */}
          {modifierGroups.map((g) => (
            <div key={g.id} className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                {g.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.name}
                    sublabel={o.price ? `+Rp${fmt(o.price)}` : null}
                    active={selectedMods[g.id] === o.id}
                    onClick={() =>
                      setSelectedMods((prev) => ({ ...prev, [g.id]: o.id }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Qty + Total + Confirm */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all"
              >
                −
              </button>
              <span className="w-6 text-center font-black text-lg">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all"
              >
                +
              </button>
            </div>
            <span className="font-black text-brand-navy text-lg">
              Rp{fmt(totalPrice)}
            </span>
          </div>

          <button
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`mt-5 w-full py-3.5 rounded-full font-bold text-white text-sm transition-all ${
              canConfirm
                ? "bg-brand-navy active:scale-95 hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {mokaLoading
              ? "Memuat…"
              : !isSynced
              ? "Belum tersedia"
              : "Tambah ke Keranjang"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddToCartModal;