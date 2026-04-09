// pages/Menu/AddToCartModal.jsx
// Uses REAL item_variants and active_modifiers from Moka API.
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const AddToCartModal = ({ item, mokaItem, mokaLoading, mokaError, onClose, onConfirm }) => {
  // ── Variants ──────────────────────────────────────────────────────────────
  const variants = useMemo(() =>
    mokaItem?.item_variants?.filter((v) => !v.is_deleted) ?? null,
  [mokaItem]);

  // ── Modifier groups ───────────────────────────────────────────────────────
  const modifierGroups = useMemo(() =>
    (mokaItem?.active_modifiers ?? [])
      .filter((m) => !m.is_deleted)
      .map((m) => ({
        id:      m.id,
        name:    m.name,
        min:     m.min_no_of_options ?? 0,
        max:     m.max_no_of_options ?? 1,
        options: (m.modifier_options ?? []).filter((o) => !o.is_deleted),
      })),
  [mokaItem]);

  // ── Initial state ─────────────────────────────────────────────────────────
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => variants?.[0]?.id ?? null
  );
  const [selectedMods, setSelectedMods] = useState(() => {
    const init = {};
    modifierGroups.forEach((g) => {
      if (g.options.length > 0) init[g.id] = g.options[0].id;
    });
    return init;
  });
  const [qty, setQty] = useState(1);

  // ── Price calc ────────────────────────────────────────────────────────────
  const selectedVariant = variants?.find((v) => v.id === selectedVariantId) ?? variants?.[0];

  const basePrice = useMemo(() => {
    if (selectedVariant?.price) return selectedVariant.price;
    return parseInt(String(item.price).replace(/\./g, ""), 10) || 0;
  }, [selectedVariant, item.price]);

  const modifiersPrice = useMemo(() =>
    modifierGroups.reduce((sum, g) => {
      const opt = g.options.find((o) => o.id === selectedMods[g.id]);
      return sum + (opt?.price ?? 0);
    }, 0),
  [modifierGroups, selectedMods]);

  const unitPrice  = basePrice + modifiersPrice;
  const totalPrice = unitPrice * qty;

  const buildMokaModifiers = () =>
    modifierGroups.map((g) => {
      const opt = g.options.find((o) => o.id === selectedMods[g.id]);
      if (!opt) return null;
      return {
        modifier_id:           g.id,
        modifier_option_id:    opt.id,
        modifier_name:         g.name,
        modifier_option_name:  opt.name,
        modifier_option_price: opt.price ?? 0,
      };
    }).filter(Boolean);

  const handleConfirm = () => {
    onConfirm({
      item,
      itemName:         item.name,
      mokaItemId:       mokaItem?.id          ?? null,
      mokaVariantId:    selectedVariant?.id    ?? null,
      mokaVariantName:  selectedVariant?.name  ?? "",
      mokaVariantSku:   selectedVariant?.sku   ?? "",
      mokaCategoryId:   mokaItem?.category_id  ?? null,
      mokaCategoryName: mokaItem?.category?.name ?? "",
      mokaModifiers:    buildMokaModifiers(),
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
          style={{ background: "linear-gradient(150deg,#0a1628 0%,#1e3a5f 60%,#0a1628 100%)" }}
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 overflow-y-auto max-h-[60vh]">

          {/* Name + live price */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 mr-4">
              <h2 className="text-xl font-black text-brand-navy leading-tight">{item.name}</h2>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.description}</p>
            </div>
            <motion.span
              key={unitPrice}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              className="text-brand-orange font-black text-lg whitespace-nowrap"
            >
              Rp{fmt(unitPrice)}
            </motion.span>
          </div>

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
                    active={selectedVariantId === v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Modifiers — from Moka active_modifiers */}
          {modifierGroups.map((group) => (
            <div key={group.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {group.name}
                </p>
                {group.min > 0 && (
                  <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    Wajib
                  </span>
                )}
                {group.max > 1 && (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Maks {group.max}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.name}
                    sublabel={opt.price > 0 ? `+Rp${fmt(opt.price)}` : null}
                    active={selectedMods[group.id] === opt.id}
                    onClick={() =>
                      setSelectedMods((prev) => ({ ...prev, [group.id]: opt.id }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ── Status Moka: loading / error / not found ── */}
          {mokaLoading && !mokaItem && (
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-4">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Memuat varian…
            </div>
          )}

          {!mokaLoading && mokaError && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-50 rounded-xl px-3 py-2 mb-4">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Gagal memuat data: {mokaError}
            </div>
          )}

          {!mokaLoading && !mokaError && !mokaItem && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-50 rounded-xl px-3 py-2 mb-4">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              Item ini belum tersinkron di Moka — pesanan tetap bisa dilanjutkan.
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1.5 flex-shrink-0">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full bg-white text-brand-navy flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 12h14"/></svg>
              </button>
              <motion.span key={qty} initial={{ scale: 1.35 }} animate={{ scale: 1 }}
                className="text-brand-navy font-black text-sm w-5 text-center leading-none">
                {qty}
              </motion.span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            {/* Tambah button - no hover scale animation */}
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-full text-white font-black text-sm shadow-md active:scale-[.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
            >
              Tambah · Rp{fmt(totalPrice)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddToCartModal;