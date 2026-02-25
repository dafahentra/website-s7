// pages/Menu/CartSidebar.jsx — Mobile bottom sheet + desktop sidebar
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuItems } from "../../data/menuData";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

function getItemById(id) {
  for (const list of Object.values(menuItems)) {
    const found = list.find((i) => String(i.id) === String(id));
    if (found) return found;
  }
  return null;
}

// ── Customer Info Modal ───────────────────────────────────────────────────────
const CustomerInfoModal = React.memo(({ totalPrice, onConfirm, onCancel }) => {
  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Nama wajib diisi";
    if (!phone.trim()) e.phone = "Nomor WhatsApp wajib diisi";
    else if (!/^(\+62|62|0)8[0-9]{8,11}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Format nomor tidak valid";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onConfirm({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] px-6 pt-4 pb-8 shadow-2xl"
      >
        {/* Handle bar mobile */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-black text-brand-navy">Detail Pemesan</h3>
          <p className="text-gray-400 text-xs mt-1">Kami akan konfirmasi pesanan via WhatsApp</p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: null })); }}
            placeholder="Nama kamu"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all ${
              errors.name
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:border-brand-orange focus:bg-white"
            }`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Nomor WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: null })); }}
            placeholder="08xxxxxxxxxx"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all ${
              errors.phone
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 focus:border-brand-orange focus:bg-white"
            }`}
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Total recap */}
        <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <span className="text-sm text-gray-500 font-medium">Total Pembayaran</span>
          <span className="text-brand-orange font-black text-base">Rp{fmt(totalPrice)}</span>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-full text-white font-black text-[15px] tracking-tight transition-all hover:scale-[1.015] active:scale-[.98] shadow-lg shadow-orange-200"
          style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
        >
          Konfirmasi Pesanan
        </button>
        <button
          onClick={onCancel}
          className="w-full mt-3 py-2.5 rounded-full text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
        >
          Kembali ke Keranjang
        </button>
      </motion.div>
    </motion.div>
  );
});
CustomerInfoModal.displayName = "CustomerInfoModal";

// ── Single cart row ───────────────────────────────────────────────────────────
const CartRow = React.memo(({ entry, onIncrement, onDecrement, onRemove }) => {
  const { itemId, qty, unitPrice, size, mods } = entry;
  const item = getItemById(itemId);
  if (!item) return null;

  const sizeLabel = size === "large" ? "Large" : "Regular";
  const modTags   = mods ? Object.values(mods).filter(Boolean) : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3.5 py-4 border-b border-gray-100/80 last:border-0"
    >
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[15px] leading-tight">{item.name}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {size && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {sizeLabel}
            </span>
          )}
          {modTags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-brand-orange font-bold text-sm mt-1.5">
          Rp{fmt(unitPrice * qty)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button
          onClick={() => onRemove(entry.key)}
          className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
          aria-label="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-1.5 py-1">
          <button
            onClick={() => qty === 1 ? onRemove(entry.key) : onDecrement(entry.key)}
            className="w-5 h-5 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-90 transition-all"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 12h14"/></svg>
          </button>
          <motion.span key={qty} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
            className="text-gray-800 font-bold text-xs w-3.5 text-center leading-none"
          >{qty}</motion.span>
          <button
            onClick={() => onIncrement(entry.key)}
            className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-sm hover:bg-orange-600 active:scale-90 transition-all"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
});
CartRow.displayName = "CartRow";

// ── Cart Panel (shared inner content) ────────────────────────────────────────
const CartPanel = ({ entries, totalItems, totalPrice, onClose, onIncrement, onDecrement, onRemove, onCheckoutClick, submitting, extraTopPadding }) => (
  <>
    <div className={`flex items-center justify-between px-6 ${extraTopPadding ? "pt-8" : "pt-4"} pb-4 flex-shrink-0`}>
      <div>
        <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Keranjang</h2>
        <p className="text-gray-400 text-xs mt-0.5">
          {totalItems > 0 ? `${totalItems} item` : "Kosong"}
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div className="h-px bg-gray-100 mx-6" />

    <div className="flex-1 overflow-y-auto px-6 py-2">
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-16">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 font-semibold text-sm">Keranjang kosong</p>
            <p className="text-gray-300 text-xs mt-0.5">Tambahkan item dari menu</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <CartRow key={entry.key} entry={entry} onIncrement={onIncrement} onDecrement={onDecrement} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      )}
    </div>

    {entries.length > 0 && (
      <div className="px-6 pb-8 pt-4 flex-shrink-0 border-t border-gray-100">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-gray-400 text-sm">Total</span>
          <span className="text-gray-900 font-black text-xl">Rp{fmt(totalPrice)}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <p className="text-green-500 text-xs font-medium">Sudah termasuk pajak</p>
        </div>

        <button
          onClick={onCheckoutClick}
          disabled={submitting}
          className="w-full py-4 rounded-full text-white font-black text-[15px] tracking-tight transition-all hover:scale-[1.015] active:scale-[.98] shadow-lg shadow-orange-200 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
        >
          {submitting ? "Memproses…" : "Lanjut ke Pembayaran"}
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-full text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
        >
          Lanjut Belanja
        </button>
      </div>
    )}
  </>
);

// ── Main CartSidebar ──────────────────────────────────────────────────────────
const CartSidebar = React.memo(({ cart, onClose, onIncrement, onDecrement, onRemove, onCheckout, submitting }) => {
  const entries = cart.filter((e) => e.qty > 0);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { totalItems, totalPrice } = useMemo(() => ({
    totalItems: entries.reduce((s, e) => s + e.qty, 0),
    totalPrice: entries.reduce((s, e) => s + e.unitPrice * e.qty, 0),
  }), [entries]);

  const handleCheckoutClick = () => setShowCustomerModal(true);
  const handleCustomerConfirm = ({ name, phone }) => {
    setShowCustomerModal(false);
    onCheckout({ name, phone });
  };

  const panelProps = { entries, totalItems, totalPrice, onClose, onIncrement, onDecrement, onRemove, onCheckoutClick: handleCheckoutClick, submitting };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {isMobile ? (
        /* Mobile: bottom sheet slides up */
        <motion.div
          key="bottom-sheet"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col rounded-t-[2rem] overflow-hidden"
          style={{ maxHeight: "90dvh" }}
        >
          {/* Drag handle */}
          <div className="pt-3 pb-0 flex justify-center flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>
          <CartPanel {...panelProps} extraTopPadding={false} />
        </motion.div>
      ) : (
        /* Desktop: right sidebar */
        <motion.div
          key="panel"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          className="fixed top-0 right-0 h-full w-full max-w-[360px] z-50 bg-white/95 flex flex-col"
          style={{ backdropFilter: "blur(20px)" }}
        >
          <CartPanel {...panelProps} extraTopPadding={true} />
        </motion.div>
      )}

      {/* Customer info popup */}
      <AnimatePresence>
        {showCustomerModal && (
          <CustomerInfoModal
            totalPrice={totalPrice}
            onConfirm={handleCustomerConfirm}
            onCancel={() => setShowCustomerModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

CartSidebar.displayName = "CartSidebar";
export default CartSidebar;