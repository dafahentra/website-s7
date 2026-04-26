// src/pages/Loyalty/index.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "../../styles/designSystem";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

// ── Shorthand tokens dari COLORS designSystem ─────────────────────────────────
const C = {
  navy:        COLORS.primary.navy,           // #1d3866
  orange:      COLORS.primary.orange,         // #f39248
  green:       COLORS.secondary.green,        // #6b8e4e
  gray50:      COLORS.neutral.gray[50],
  gray100:     COLORS.neutral.gray[100],
  gray200:     COLORS.neutral.gray[200],
  gray300:     COLORS.neutral.gray[300],
  gray400:     COLORS.neutral.gray[400],
  gray500:     COLORS.neutral.gray[500],
  gray600:     COLORS.neutral.gray[600],
  gray700:     COLORS.neutral.gray[700],
  gray900:     COLORS.neutral.gray[900],
  cream:       COLORS.neutral.cream,
  brandOrange: COLORS.overlays.brandOrange,
};

const THEME = {
  blueGradient:   { background: `linear-gradient(135deg, ${C.navy}, #2d4f8a)` },
  orangeGradient: { background: C.brandOrange },
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Logo: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  Check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Reward: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 12v10H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
  Back: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Success: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Earn: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Redeem: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
  Lock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Info: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Phone: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.66A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  ArrowRight: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }
  return String(dateStr).split(",")[0];
};

// ── Phone Input ───────────────────────────────────────────────────────────────
const PhoneInput = ({ onFound }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/.netlify/functions/loyalty-get?phone=${encodeURIComponent(phone.trim())}&_=${Date.now()}`);
      const data = await res.json();
      if (data.found === false) {
        setError("Nomor tidak ditemukan. Pastikan kamu sudah pernah bertransaksi.");
        return;
      }
      onFound({ ...data, inputPhone: phone.trim() });
    } catch {
      setError("Gagal mengambil data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-[400px] mx-auto"
    >
      <div
        className="bg-white rounded-[28px] p-7"
        style={{ boxShadow: "0 2px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={THEME.blueGradient}>
            <Icons.Logo className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-none tracking-tight" style={{ color: C.navy }}>
              Sector Seven
            </h1>
            <p className="text-[11px] mt-[3px] font-medium tracking-widest uppercase" style={{ color: C.gray400 }}>
              Loyalty Program
            </p>
          </div>
        </div>

        {/* Hero banner */}
        <div className="rounded-[20px] p-5 mb-7 text-white relative overflow-hidden" style={THEME.blueGradient}>
          <div className="absolute -right-6 -top-6 w-[110px] h-[110px] rounded-full opacity-[0.18]" style={{ background: C.orange }} />
          <div className="absolute right-4 bottom-3 w-[60px] h-[60px] rounded-full bg-white opacity-[0.04]" />
          <h2 className="text-[19px] font-bold mb-1 relative z-10 leading-snug tracking-tight">
            Kumpulkan poin,<br />raih reward.
          </h2>
          <p className="text-[11px] text-white/60 font-medium relative z-10 mt-0.5">
            Setiap Rp10.000 belanja = 10 poin
          </p>
        </div>

        {/* Input */}
        <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.gray500 }}>
          Nomor WhatsApp
        </label>
        <div className="relative mb-2">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.Phone className="w-4 h-4" style={{ color: C.gray400 }} />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="081234567890"
            className="w-full pl-10 pr-4 py-3 rounded-[14px] text-[13px] font-medium bg-[#fafafa] outline-none transition-all placeholder:text-gray-300"
            style={{ border: `1.5px solid ${C.gray200}`, color: C.gray900 }}
            onFocus={(e) => (e.target.style.borderColor = C.navy)}
            onBlur={(e) => (e.target.style.borderColor = C.gray200)}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-center mb-3 font-medium"
            style={{ color: "#ef4444" }}
          >
            {error}
          </motion.p>
        )}

        <button
          onClick={handleCheck}
          disabled={loading || !phone.trim()}
          className="w-full mt-1 p-3.5 rounded-[14px] text-white font-semibold text-[13px] transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
          style={THEME.blueGradient}
        >
          {loading ? (
            <span>Mengecek...</span>
          ) : (
            <>
              <span>Cek Poin Saya</span>
              <Icons.ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Info strip */}
        <div
          className="mt-4 flex items-center gap-2.5 p-3 rounded-[12px]"
          style={{ background: C.gray50, border: `1px solid ${C.gray100}` }}
        >
          <Icons.Info className="w-4 h-4 shrink-0" style={{ color: C.gray400 }} />
          <p className="text-[11px] font-medium" style={{ color: C.gray500 }}>
            Berlaku untuk{" "}
            <strong className="font-semibold" style={{ color: C.navy }}>online & offline</strong> order.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Reward Card ───────────────────────────────────────────────────────────────
// Seluruh card adalah <div> non-interaktif.
// Satu-satunya elemen yang bisa diklik adalah tombol "Tukar" (unlocked saja).
const RewardCard = ({ reward, currentPoints, onClickRedeem }) => {
  const unlocked = currentPoints >= reward.points;

  return (
    <div
      className={`w-full bg-white rounded-[16px] p-3.5 flex items-center gap-3 shrink-0 ${unlocked ? "" : "opacity-50"}`}
      style={{
        border: `1.5px solid ${unlocked ? C.gray200 : C.gray100}`,
        boxShadow: unlocked ? "0 1px 8px rgba(0,0,0,0.04)" : "none",
      }}
    >
      {/* Icon — sama semua tier, non-interaktif */}
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ background: unlocked ? `${C.navy}12` : C.gray100 }}
      >
        <Icons.Reward className="w-[18px] h-[18px]" style={{ color: unlocked ? C.navy : C.gray400 }} />
      </div>

      {/* Info teks — pointer-events-none agar tidak clickable */}
      <div className="flex-1 min-w-0 pointer-events-none select-none">
        <div className="text-[13px] font-semibold leading-snug" style={{ color: C.gray900 }}>
          {reward.label}
        </div>
        <div className="text-[11px] mt-0.5 font-medium line-clamp-1" style={{ color: C.gray400 }}>
          {reward.description}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Icons.Logo className="w-3 h-3" style={{ color: C.orange }} />
          <span className="text-[11px] font-semibold" style={{ color: C.orange }}>
            {fmt(reward.points)} poin
          </span>
        </div>
      </div>

      {/* Satu-satunya elemen interaktif: tombol Tukar */}
      {unlocked ? (
        <button
          onClick={() => onClickRedeem(reward)}
          className="px-3.5 py-2 rounded-[10px] text-white font-semibold text-[11px] whitespace-nowrap shrink-0 tracking-tight transition-all active:scale-[0.95] hover:opacity-90"
          style={THEME.orangeGradient}
        >
          Tukar
        </button>
      ) : (
        // Locked: tampilan statis, tidak ada interaksi
        <div className="text-right shrink-0 pointer-events-none select-none">
          <Icons.Lock className="w-3.5 h-3.5 ml-auto" style={{ color: C.gray400 }} />
          <div className="text-[10px] font-medium mt-0.5 whitespace-nowrap" style={{ color: C.gray400 }}>
            -{fmt(reward.points - currentPoints)} pts
          </div>
        </div>
      )}
    </div>
  );
};

// ── Modal Konfirmasi S&K ─────────────────────────────────────────────────────
const TermsConfirmModal = ({ reward, currentPoints, onConfirm, onCancel, loading }) => {
  const canRedeem = currentPoints >= reward.points;
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atBottom) setHasScrolled(true);
  };

  const confirmEnabled = canRedeem && hasScrolled;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 48, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 48, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-[28px] overflow-hidden max-h-[90vh] flex flex-col relative"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.gray100}` }}>
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: `${C.orange}18` }}
            >
              <Icons.Reward className="w-5 h-5" style={{ color: C.orange }} />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold leading-tight tracking-tight" style={{ color: C.gray900 }}>
                Konfirmasi Penukaran
              </h3>
              <p className="text-[12px] mt-1 font-medium" style={{ color: C.gray400 }}>
                Baca syarat & ketentuan sebelum melanjutkan.
              </p>
            </div>
          </div>
        </div>

        {/* Reward summary */}
        <div className="px-6 py-4" style={{ background: C.gray50, borderBottom: `1px solid ${C.gray100}` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.gray400 }}>
              Reward Dipilih
            </span>
            <div className="flex items-center gap-1">
              <Icons.Logo className="w-3 h-3" style={{ color: C.orange }} />
              <span className="text-[11px] font-semibold" style={{ color: C.orange }}>{fmt(reward.points)} pts</span>
            </div>
          </div>
          <div className="text-[14px] font-semibold" style={{ color: C.gray900 }}>{reward.label}</div>
          <div className="text-[11px] mt-0.5 font-medium" style={{ color: C.gray400 }}>{reward.description}</div>
        </div>

        {/* S&K body — wajib scroll ke bawah sebelum bisa konfirmasi */}
        <div
          className="px-6 py-5 overflow-y-auto flex-1"
          style={{ scrollbarWidth: "thin" }}
          onScroll={handleScroll}
        >
          <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.gray400 }}>
            Syarat & Ketentuan
          </div>
          <ol className="space-y-3.5 text-[12px] leading-relaxed" style={{ color: C.gray700 }}>
            {[
              ["Kesesuaian Reward", "Poin yang ditukarkan hanya berlaku untuk produk yang tertera pada deskripsi pilihan claim Anda. Reward tidak dapat diubah, di-custom, atau ditukar dengan menu di luar ketentuan tier yang dipilih."],
              ["Tidak Dapat Digabung", "Penukaran poin ini murni sebagai loyalty reward dan tidak dapat digabungkan dengan promo, diskon operasional (seperti diskon website 15%), atau voucher Sector Seven lainnya dalam satu transaksi yang sama."],
              ["Ketersediaan Stok", "Produk reward (terutama kategori pastry/sourdough) bergantung pada ketersediaan stok harian di bar. Jika produk kosong, customer berhak menunda klaim atau mengalihkan ke opsi minuman yang setara sesuai tier poin tersebut."],
              ["Final & Non-Refundable", "Poin yang sudah berhasil dikonfirmasi dan ditukarkan tidak dapat dibatalkan, dikembalikan, atau diuangkan dalam bentuk apa pun."],
              ["Masa Berlaku Penukaran", "Setelah Anda menekan tombol konfirmasi, penukaran ini wajib di-redeem pada hari operasional yang sama di Sector Seven."],
              ["Kebijakan Otoritas", "Sector Seven berhak penuh untuk membatalkan penukaran poin jika ditemukan indikasi kecurangan, manipulasi sistem, atau ketidaksesuaian data customer pada sistem CRM kami."],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-2.5">
                <span className="font-bold shrink-0 text-[11px] mt-[1px]" style={{ color: C.navy }}>{i + 1}.</span>
                <div>
                  <strong className="font-semibold" style={{ color: C.navy }}>{title}: </strong>
                  {desc}
                </div>
              </li>
            ))}
          </ol>

          {!canRedeem && (
            <div
              className="mt-4 p-3.5 rounded-[14px] text-[12px] font-medium flex items-center gap-2.5"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            >
              <Icons.Lock className="w-4 h-4 shrink-0" />
              <span>Poin belum cukup. Butuh {fmt(reward.points - currentPoints)} poin lagi.</span>
            </div>
          )}
          <div className="h-2" />
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {!hasScrolled && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-[88px] left-0 right-0 flex justify-center pointer-events-none"
            >
              <div
                className="flex items-center gap-1.5 text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full"
                style={{ background: C.navy, boxShadow: "0 4px 12px rgba(29,56,102,0.25)" }}
              >
                <Icons.ChevronDown className="w-3 h-3 animate-bounce" />
                Scroll untuk membaca semua
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div
          className="px-6 pb-6 pt-4 grid grid-cols-2 gap-3"
          style={{ borderTop: `1px solid ${C.gray100}` }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            className="py-3.5 rounded-[14px] font-semibold text-[13px] transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: C.gray100, color: C.gray700 }}
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(reward)}
            disabled={loading || !confirmEnabled}
            className="py-3.5 rounded-[14px] font-semibold text-[13px] text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: confirmEnabled
                ? "linear-gradient(135deg, #15803d, #16a34a)"
                : C.gray300,
            }}
          >
            {loading
              ? "Memproses..."
              : !hasScrolled
                ? "Baca S&K dulu"
                : canRedeem
                  ? "Setuju & Tukar"
                  : "Poin Kurang"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({ customer: initialCustomer, onBack }) => {
  const [customer, setCustomer] = useState(initialCustomer);
  const [points, setPoints] = useState(initialCustomer.points || 0);
  const [redeemed, setRedeemed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("reward");
  const [confirmReward, setConfirmReward] = useState(null);

  const activePhone = customer.phone || customer.inputPhone;

  const refreshCustomer = async () => {
    try {
      const res = await fetch(`/.netlify/functions/loyalty-get?phone=${encodeURIComponent(activePhone)}&_=${Date.now()}`);
      const data = await res.json();
      if (data.found !== false) {
        setCustomer({ ...data, inputPhone: activePhone });
        setPoints(data.points || 0);
      }
    } catch {}
  };

  const handleClickRedeem = (reward) => {
    setError("");
    setConfirmReward(reward);
  };

  const handleConfirmRedeem = async (reward) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/.netlify/functions/loyalty-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activePhone, rewardId: reward.id, agreedTerms: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal redeem");
      setPoints(data.pointsLeft);
      setRedeemed(data);
      setConfirmReward(null);
      setTimeout(() => setRedeemed(null), 6000);
      await refreshCustomer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const history = customer.history || [];
  const totalVisits = history.length;
  const rewardsClaimed = history.filter((h) => h.points < 0).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full flex flex-col md:items-center relative z-0"
      >
        <div className="w-full md:max-w-[900px] p-4 md:pt-6">

          {/* Top bar */}
          <div
            className="bg-white px-4 py-3.5 flex items-center gap-3 rounded-[20px] w-full mb-5"
            style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
          >
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors"
              style={{ background: C.gray100, color: C.gray500 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.gray200)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.gray100)}
            >
              <Icons.Back className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0" style={THEME.blueGradient}>
                <Icons.Logo className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight" style={{ color: C.navy }}>Sector Seven</span>
            </div>
          </div>

          <div className="relative md:grid md:grid-cols-2 md:gap-6">

            {/* Kolom Kiri */}
            <div className="flex flex-col relative z-10">

              {/* Points card */}
              <div
                className="rounded-[22px] p-5 pb-6 text-white relative overflow-hidden"
                style={{ ...THEME.blueGradient, boxShadow: "0 4px 24px rgba(29,56,102,0.18)" }}
              >
                <div className="absolute -right-8 -top-8 w-[130px] h-[130px] rounded-full opacity-[0.22]" style={{ background: C.orange }} />
                <div className="absolute -left-5 -bottom-10 w-[100px] h-[100px] rounded-full bg-white opacity-[0.04]" />

                <div className="relative z-10 mb-5">
                  <div className="text-[11px] text-white/50 font-medium uppercase tracking-widest">Selamat datang,</div>
                  <div className="text-[17px] font-bold text-white mt-0.5 tracking-tight">{customer.name || activePhone}</div>
                </div>

                <div className="relative z-10">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Total Poin</div>
                  <motion.div
                    key={points}
                    initial={{ scale: 1.04 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-[52px] font-bold leading-none my-1 tracking-tighter"
                  >
                    {fmt(points)}
                  </motion.div>
                  <div className="text-[11px] text-white/40 font-medium">Rp10.000 = 10 poin · Online & Offline</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div
                  className="bg-white rounded-[16px] p-3.5 flex items-center gap-2.5"
                  style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: `${C.orange}18` }}
                  >
                    <Icons.Check className="w-4 h-4" style={{ color: C.orange }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: C.gray400 }}>Total Kunjungan</p>
                    <p className="text-[15px] font-bold tracking-tight" style={{ color: C.gray900 }}>{totalVisits}x</p>
                  </div>
                </div>
                <div
                  className="bg-white rounded-[16px] p-3.5 flex items-center gap-2.5"
                  style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: `${C.navy}12` }}
                  >
                    <Icons.Reward className="w-4 h-4" style={{ color: C.navy }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: C.gray400 }}>Reward Ditukar</p>
                    <p className="text-[15px] font-bold tracking-tight" style={{ color: C.gray900 }}>{rewardsClaimed}x</p>
                  </div>
                </div>
              </div>

              {/* Mobile tab switcher */}
              <div
                className="p-1.5 rounded-full flex md:hidden mt-4 relative z-0"
                style={{ background: C.gray100 }}
              >
                {["reward", "history"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2.5 rounded-full text-[12px] font-semibold transition-colors relative z-10"
                    style={{ color: activeTab === tab ? C.navy : C.gray400 }}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-white rounded-full z-[-1]"
                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab === "reward" ? "Katalog Reward" : "Riwayat"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kolom Kanan — Rewards */}
            <div className={`mt-4 md:mt-0 md:absolute md:inset-y-0 md:right-0 md:w-[calc(50%-12px)] flex-col ${activeTab === "reward" ? "flex" : "hidden md:flex"}`}>

              <AnimatePresence>
                {redeemed && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="bg-white rounded-[16px] p-3.5 flex items-center gap-3 mb-3 shrink-0"
                    style={{ border: `1px solid ${C.green}30`, boxShadow: `0 1px 8px ${C.green}12` }}
                  >
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "#f0fdf4" }}>
                      <Icons.Success className="w-4 h-4" style={{ color: "#16a34a" }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "#15803d" }}>Reward berhasil diklaim!</p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: C.gray400 }}>
                        Kode terkirim ke WhatsApp. Tunjukkan ke kasir.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p
                  className="text-[11px] text-center font-medium py-2 rounded-[12px] mb-3 shrink-0"
                  style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca" }}
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col flex-1 min-h-0">
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-3 shrink-0" style={{ color: C.gray400 }}>
                  Reward Tersedia
                </div>
                <div
                  className="flex flex-col justify-start gap-2 flex-1 min-h-0 overflow-y-auto pr-1 max-h-[400px] md:max-h-none"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {(customer.allRewards || []).map((r) => (
                    <RewardCard
                      key={r.id}
                      reward={r}
                      currentPoints={points}
                      onClickRedeem={handleClickRedeem}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History section */}
          <div className={`w-full ${activeTab === "history" ? "block mt-4" : "hidden md:block md:mt-8"}`}>
            {activeTab !== "history" && (
              <div style={{ borderTop: `1px solid ${C.gray100}`, paddingTop: "1.5rem" }} />
            )}
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.gray400 }}>
              Riwayat Transaksi
            </div>
            {history.length === 0 ? (
              <div
                className="text-center py-8 text-[12px] font-medium bg-white rounded-[16px]"
                style={{ color: C.gray400, border: `1px solid ${C.gray100}` }}
              >
                Belum ada transaksi
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] md:max-h-[500px] overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {history.map((h, i) => {
                  const isEarn = h.points > 0;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-[14px] p-3.5 flex items-center gap-3"
                      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: isEarn ? "#f0fdf4" : "#fef2f2" }}
                      >
                        {isEarn
                          ? <Icons.Earn className="w-4 h-4" style={{ color: "#16a34a" }} />
                          : <Icons.Redeem className="w-4 h-4" style={{ color: "#ef4444" }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate leading-snug" style={{ color: C.gray900 }}>
                          {h.note}
                        </p>
                        <p className="text-[10px] mt-0.5 font-medium" style={{ color: C.gray400 }}>
                          {formatDate(h.createdAt)}
                        </p>
                      </div>
                      <div
                        className="text-[14px] font-bold whitespace-nowrap tracking-tight"
                        style={{ color: isEarn ? "#16a34a" : "#ef4444" }}
                      >
                        {isEarn ? "+" : ""}{fmt(h.points)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* S&K Modal */}
      <AnimatePresence>
        {confirmReward && (
          <TermsConfirmModal
            reward={confirmReward}
            currentPoints={points}
            onConfirm={handleConfirmRedeem}
            onCancel={() => setConfirmReward(null)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const LoyaltyPage = () => {
  const [customer, setCustomer] = useState(null);
  return (
    <div
      className="min-h-screen flex items-start justify-center pt-[130px] lg:pt-[120px] pb-12 px-4"
      style={{ background: C.cream }}
    >
      <div className="w-full">
        <AnimatePresence mode="wait">
          {!customer
            ? <PhoneInput key="input" onFound={setCustomer} />
            : <Dashboard key="dash" customer={customer} onBack={() => setCustomer(null)} />
          }
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyPage;