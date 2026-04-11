// pages/Menu/CartSidebar.jsx — Mobile bottom sheet + desktop sidebar
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuItems } from "../../data/menuData";
import { validateDiscount } from "../../services/mokaApi";
import { calcOnlineFee } from "../../utils/onlineFee";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

function getItemById(id) {
  for (const list of Object.values(menuItems)) {
    const found = list.find((i) => String(i.id) === String(id));
    if (found) return found;
  }
  return null;
}

// ── Customer Info Modal ───────────────────────────────────────────────────────
const CustomerInfoModal = React.memo(({
  subtotal, discountAmount, onlineFee, finalPrice,
  discount, savedInfo, onSave, onConfirm, onCancel,
}) => {
  const [name,      setName]      = useState(savedInfo?.name      || "");
  const [phone,     setPhone]     = useState(savedInfo?.phone     || "");
  const [orderNote, setOrderNote] = useState(savedInfo?.orderNote || "");
  const [errors,    setErrors]    = useState({});

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
    if (Object.keys(e).length) { setErrors(e); return; }
    const info = { name: name.trim(), phone: phone.trim(), orderNote: orderNote.trim() };
    onSave(info);
    onConfirm(info);
  };

  const save = (fields) => onSave({ name, phone, orderNote, ...fields });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] px-6 pt-4 pb-8 shadow-2xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="mb-5">
          <h3 className="text-xl font-black text-gray-900">Detail Pesanan</h3>
          <p className="text-gray-400 text-xs mt-1">Pembayaran via QRIS / GoPay / Transfer</p>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama</label>
          <input
            type="text" value={name}
            onChange={(e) => { setName(e.target.value); save({ name: e.target.value }); setErrors((p) => ({ ...p, name: null })); }}
            placeholder="Nama kamu"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all ${
              errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:bg-white"
            }`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nomor WhatsApp</label>
          <input
            type="tel" value={phone}
            onChange={(e) => { setPhone(e.target.value); save({ phone: e.target.value }); setErrors((p) => ({ ...p, phone: null })); }}
            placeholder="08xxxxxxxxxx"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all ${
              errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:bg-white"
            }`}
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Order Note */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Catatan <span className="text-gray-300 normal-case font-normal">(opsional)</span>
          </label>
          <textarea
            value={orderNote}
            onChange={(e) => { setOrderNote(e.target.value); save({ orderNote: e.target.value }); }}
            placeholder="Contoh: less ice, no sugar, extra hot..."
            rows={2} maxLength={200}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-orange-400 focus:bg-white resize-none"
          />
        </div>

        {/* Total recap */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-700">Rp{fmt(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-green-600">Diskon ({discount?.code})</span>
              <span className="font-semibold text-green-600">-Rp{fmt(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Biaya online order</span>
            <span className="font-semibold text-gray-500">+Rp{fmt(onlineFee)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-gray-200">
            <span className="font-bold text-gray-800">Total Bayar</span>
            <span className="font-black text-base text-orange-500">Rp{fmt(finalPrice)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-full text-white font-black text-[15px] tracking-tight transition-all hover:scale-[1.015] active:scale-[.98] shadow-lg shadow-orange-200"
          style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
        >
          Lanjut ke Pembayaran →
        </button>
        <button onClick={onCancel} className="w-full mt-3 py-2.5 rounded-full text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors">
          Kembali
        </button>
      </motion.div>
    </motion.div>
  );
});
CustomerInfoModal.displayName = "CustomerInfoModal";

// ── Discount Input ────────────────────────────────────────────────────────────
const DiscountInput = React.memo(({ orderTotal, discount, onApplied, onRemoved }) => {
  const [code,    setCode]    = useState(discount?.code || "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const isApplied = discount?.valid;

  const handleApply = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const result = await validateDiscount({ code: trimmed, orderTotal });
      if (result.valid) {
        onApplied(result);
      } else {
        setError(result.error || "Kode tidak valid");
        onRemoved();
      }
    } catch (err) {
      setError(err.message || "Gagal memvalidasi kode. Coba lagi.");
      onRemoved();
    } finally {
      setLoading(false);
    }
  }, [code, orderTotal, onApplied, onRemoved]);

  const handleRemove = () => {
    setCode("");
    setError("");
    onRemoved();
  };

  return (
    <div className="px-6 pb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && !isApplied && handleApply()}
          placeholder="Punya kode diskon?"
          disabled={isApplied}
          className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
            isApplied
              ? "border-green-300 bg-green-50 text-green-700"
              : error
              ? "border-red-300 bg-red-50 text-gray-800"
              : "border-gray-200 bg-gray-50 text-gray-800 focus:border-orange-400 focus:bg-white"
          }`}
        />
        {isApplied ? (
          <button onClick={handleRemove} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-gray-200 transition-all flex-shrink-0">
            Hapus
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex-shrink-0 disabled:opacity-40 active:scale-95"
            style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
          >
            {loading ? "…" : "Pakai"}
          </button>
        )}
      </div>

      {error && !isApplied && (
        <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}

      {isApplied && (
        <p className="text-green-600 text-xs mt-1.5 ml-1 flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          {discount.description} — hemat Rp{fmt(discount.discountAmount)}
        </p>
      )}
    </div>
  );
});
DiscountInput.displayName = "DiscountInput";

// ── Cart Row ──────────────────────────────────────────────────────────────────
const CartRow = React.memo(({ entry, onIncrement, onDecrement, onRemove }) => {
  const { itemId, qty, unitPrice, mokaVariantName, mokaModifiers } = entry;
  const item = getItemById(itemId);
  if (!item) return null;

  const tags = [mokaVariantName, ...(mokaModifiers ?? []).map((m) => m.modifier_option_name)].filter(Boolean);

  return (
    <motion.div
      layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }}
      className="flex items-start gap-3.5 py-4 border-b border-gray-100/80 last:border-0"
    >
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[15px] leading-tight">{item.name}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        <p className="text-orange-500 font-bold text-sm mt-1.5">Rp{fmt(unitPrice * qty)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button onClick={() => onRemove(entry.key)} className="text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
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
            className="text-gray-800 font-bold text-xs w-3.5 text-center">{qty}</motion.span>
          <button
            onClick={() => onIncrement(entry.key)}
            className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm hover:bg-orange-600 active:scale-90 transition-all"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
});
CartRow.displayName = "CartRow";

// ── Cart Panel ────────────────────────────────────────────────────────────────
const CartPanel = ({
  entries, totalItems, subtotal, discountAmount, onlineFee, finalPrice, discount,
  onClose, onIncrement, onDecrement, onRemove,
  onCheckoutClick, onDiscountApplied, onDiscountRemoved,
  submitting, extraTopPadding,
}) => (
  <>
    <div className={`flex items-center justify-between px-6 ${extraTopPadding ? "pt-8" : "pt-4"} pb-4 flex-shrink-0`}>
      <div>
        <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Keranjang</h2>
        <p className="text-gray-400 text-xs mt-0.5">{totalItems > 0 ? `${totalItems} item` : "Kosong"}</p>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all" aria-label="Tutup">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold text-sm">Keranjang kosong</p>
          <p className="text-gray-300 text-xs">Tambahkan item dari menu</p>
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
      <>
        <div className="h-px bg-gray-100 mx-6 mt-2" />

        {/* Discount */}
        <DiscountInput
          orderTotal={subtotal}
          discount={discount}
          onApplied={onDiscountApplied}
          onRemoved={onDiscountRemoved}
        />

        {/* Footer */}
        <div className="px-6 pb-8 pt-2 flex-shrink-0 border-t border-gray-100">
          <div className="space-y-1 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-semibold text-gray-700">Rp{fmt(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Diskon ({discount?.code})</span>
                <span className="font-semibold text-green-600">-Rp{fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1">
                Biaya online
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">online</span>
              </span>
              <span className="font-semibold text-gray-500">+Rp{fmt(onlineFee)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-800 font-bold">Total</span>
              <span className="text-gray-900 font-black text-xl">Rp{fmt(finalPrice)}</span>
            </div>
          </div>

          <button
            onClick={onCheckoutClick}
            disabled={submitting}
            className="w-full py-4 rounded-full text-white font-black text-[15px] tracking-tight transition-all hover:scale-[1.015] active:scale-[.98] shadow-lg shadow-orange-200 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#FF6B35,#e85d2a)" }}
          >
            {submitting ? "Memproses…" : "Lanjut ke Pembayaran →"}
          </button>
          <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-full text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors">
            Lanjut Belanja
          </button>
        </div>
      </>
    )}
  </>
);

// ── Main CartSidebar ──────────────────────────────────────────────────────────
const CartSidebar = React.memo(({ cart, onClose, onIncrement, onDecrement, onRemove, onCheckout, submitting }) => {
  const entries = cart.filter((e) => e.qty > 0);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [savedInfo,         setSavedInfo]         = useState({ name: "", phone: "", orderNote: "" });
  const [discount,          setDiscount]          = useState(null);
  const [pendingPromo,      setPendingPromo]      = useState(null);

  // Auto-apply diskon dari URL param ?promo=KODE
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const promoCode = params.get("promo");
    if (!promoCode) return;

    // Hapus param dari URL segera
    const url = new URL(window.location.href);
    url.searchParams.delete("promo");
    window.history.replaceState({}, "", url.toString());

    // Set kode sebagai pending — akan divalidasi saat cart dibuka & ada items
    setPendingPromo(promoCode.toUpperCase());
  }, []);



  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Kalkulasi harga ─────────────────────────────────────────────────────────
  const { totalItems, subtotal, discountAmount, onlineFee, finalPrice } = useMemo(() => {
    const sub   = entries.reduce((s, e) => s + e.unitPrice * e.qty, 0);
    const disc  = discount?.discountAmount || 0;
    const after = Math.max(0, sub - disc);
    const fee   = calcOnlineFee(after);
    return {
      totalItems:     entries.reduce((s, e) => s + e.qty, 0),
      subtotal:       sub,
      discountAmount: disc,
      onlineFee:      fee,
      finalPrice:     after + fee,
    };
  }, [entries, discount]);

  // Validasi pending promo saat subtotal sudah ada (setelah useMemo)
  useEffect(() => {
    if (!pendingPromo || subtotal <= 0 || discount) return;
    validateDiscount({ code: pendingPromo, orderTotal: subtotal })
      .then((result) => {
        if (result.valid) setDiscount(result);
      })
      .catch(() => {})
      .finally(() => setPendingPromo(null));
  }, [pendingPromo, subtotal, discount]);

  const handleCheckoutClick   = () => setShowCustomerModal(true);
  const handleCustomerConfirm = (info) => {
    setShowCustomerModal(false);
    // Kirim semua: info customer + diskon + kalkulasi harga lengkap
    onCheckout({ ...info, discount, subtotal, discountAmount, onlineFee, finalPrice });
  };

  const panelProps = {
    entries, totalItems, subtotal, discountAmount, onlineFee, finalPrice, discount,
    onClose, onIncrement, onDecrement, onRemove,
    onCheckoutClick:   handleCheckoutClick,
    onDiscountApplied: setDiscount,
    onDiscountRemoved: () => setDiscount(null),
    submitting,
  };

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {isMobile ? (
        <motion.div
          key="bottom-sheet"
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col rounded-t-[2rem] overflow-hidden"
          style={{ maxHeight: "90dvh" }}
        >
          <div className="pt-3 pb-0 flex justify-center flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>
          <CartPanel {...panelProps} extraTopPadding={false} />
        </motion.div>
      ) : (
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

      <AnimatePresence>
        {showCustomerModal && (
          <CustomerInfoModal
            subtotal={subtotal}
            discountAmount={discountAmount}
            onlineFee={onlineFee}
            finalPrice={finalPrice}
            discount={discount}
            savedInfo={savedInfo}
            onSave={setSavedInfo}
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