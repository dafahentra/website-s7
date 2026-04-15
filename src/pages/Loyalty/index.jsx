// src/pages/Loyalty/index.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "../../styles/designSystem";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

// ── Kumpulan Icon SVG ────────────────────────────────────────────────────────
const Icons = {
  Logo: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  // Fix: sebelumnya SVG ini adalah icon layers/stack, bukan centang
  Check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Reward: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Back: (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Success: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Earn: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  // Fix: sebelumnya identik dengan Reward (copy-paste error) — sekarang gift/tag icon
  Redeem: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
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

// Menggunakan COLORS dari design system — tidak ada duplikasi nilai warna
const THEME = {
  blueGradient:   { background: `linear-gradient(135deg, ${COLORS.primary.navy}, #2d4f8a)` },
  orangeGradient: { background: COLORS.overlays.brandOrange },
};

const FontWrapper = ({ children }) => (
  <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
    <style>
      {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}
    </style>
    {children}
  </div>
);

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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[420px] mx-auto">
      <div className="bg-white rounded-[24px] p-7 shadow-[0_8px_40px_rgba(29,56,102,0.08)] relative z-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={THEME.blueGradient}>
            <Icons.Logo className="w-[20px] h-[20px] text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-black text-[#1d3866] leading-none">Sector Seven</h1>
            <p className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">Loyalty Program</p>
          </div>
        </div>

        <div className="rounded-[18px] p-5 mb-5 text-white relative overflow-hidden" style={THEME.blueGradient}>
          <div className="absolute -right-5 -top-5 w-[100px] h-[100px] rounded-full bg-[#f39248] opacity-20" />
          <h2 className="text-[20px] font-black mb-1 relative z-10 leading-tight">Kumpulkan poin,<br />raih reward!</h2>
          <p className="text-[12px] text-white/70 font-medium relative z-10">Setiap Rp10.000 belanja = 10 poin</p>
        </div>

        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nomor WhatsApp</div>
        <div className="relative mb-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Contoh: 081234567890"
            className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-[13px] font-semibold text-[#111827] bg-gray-50 outline-none focus:border-[#f39248] focus:bg-white transition-all"
          />
        </div>
        {error && <p className="text-red-500 text-[12px] text-center mb-2 font-semibold">{error}</p>}

        <button
          onClick={handleCheck}
          disabled={loading || !phone.trim()}
          className="w-full p-3.5 rounded-full text-white font-black text-[13px] transition-transform active:scale-95 disabled:opacity-40"
          style={{ ...THEME.orangeGradient, letterSpacing: "0.01em" }}
        >
          {loading ? "Mengecek..." : "Cek Poin Saya →"}
        </button>

        <div className="mt-4 p-3 bg-[#f8f9f5] border border-[#f39248]/20 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f39248]/15 flex items-center justify-center shrink-0">
            <Icons.Check className="w-3.5 h-3.5 text-[#e67e22]" />
          </div>
          <p className="text-[11px] text-[#4b5563] font-medium">Berlaku untuk <strong className="text-[#e67e22]">online & offline</strong> order.</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Reward Card ───────────────────────────────────────────────────────────────
const RewardCard = ({ reward, currentPoints, onRedeem, loading }) => {
  const unlocked = currentPoints >= reward.points;
  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("kopi")) return "☕";
    if (l.includes("diskon")) return "%";
    if (l.includes("croissant")) return "🥐";
    return "🎁";
  };

  return (
    <div className={`bg-white rounded-[14px] p-3.5 flex items-center gap-3 border-[1.5px] transition-colors shrink-0 ${unlocked ? "border-[#f39248]/30 shadow-sm" : "border-transparent opacity-60"}`}>
      <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0 text-xl ${unlocked ? "bg-[#f39248]/10" : "bg-gray-100"}`}>
        {getIcon(reward.label)}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-extrabold text-[#111827]">{reward.label}</div>
        <div className="text-[11px] text-[#9ca3af] mt-0.5 font-medium line-clamp-1">{reward.description}</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f39248]"></div>
          <span className="text-[11px] font-extrabold text-[#f39248]">{fmt(reward.points)} poin</span>
        </div>
      </div>
      {unlocked ? (
        <button onClick={() => onRedeem(reward)} disabled={loading} className="px-4 py-2 rounded-full text-white font-extrabold text-[11px] whitespace-nowrap transition-transform hover:scale-105 active:scale-95 disabled:opacity-50" style={THEME.orangeGradient}>
          Tukar
        </button>
      ) : (
        <div className="text-[11px] text-gray-400 font-bold whitespace-nowrap">{fmt(reward.points)} pts</div>
      )}
    </div>
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

  const handleRedeem = async (reward) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/.netlify/functions/loyalty-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: activePhone, rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPoints(data.pointsLeft);
      setRedeemed(data);
      setTimeout(() => setRedeemed(null), 5000);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col md:items-center relative z-0">
      
      {/* Wrapper Utama */}
      <div className="w-full md:max-w-[900px] p-4 md:pt-6">
        
        {/* Kontainer Atas (Header) */}
        <div className="bg-white px-4 py-4 flex items-center gap-3 rounded-[20px] shadow-sm border border-gray-100/50 w-full mb-5">
          <button onClick={onBack} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <Icons.Back className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={THEME.blueGradient}>
              <Icons.Logo className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-black text-[#1d3866]">Sector Seven</span>
          </div>
        </div>

        <div className="relative md:grid md:grid-cols-2 md:gap-6">
          
          {/* Kolom Kiri */}
          <div className="flex flex-col relative z-10">
            <div className="rounded-[20px] p-5 pb-6 text-white relative overflow-hidden shadow-sm" style={THEME.blueGradient}>
              <div className="absolute -right-8 -top-8 w-[130px] h-[130px] rounded-full bg-[#f39248] opacity-25 mix-blend-screen" />
              <div className="absolute -left-5 -bottom-10 w-[100px] h-[100px] rounded-full bg-white opacity-5" />
              
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                  <div className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">Selamat datang,</div>
                  <div className="text-[16px] font-extrabold text-white mt-0.5">{customer.name || activePhone}</div>
                </div>
              </div>

              <div className="relative z-10 mt-2">
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Total Poin Kamu</div>
                <motion.div key={points} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-[52px] font-black leading-none my-1">
                  {fmt(points)}
                </motion.div>
                <div className="text-[11px] text-white/50 font-medium mt-1">Rp10.000 = 10 poin · Berlaku Online & Offline</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-[14px] p-3 flex items-center gap-2.5 shadow-sm border border-gray-100/50">
                <div className="w-8 h-8 rounded-[10px] bg-[#f39248]/10 flex items-center justify-center shrink-0">
                  <Icons.Check className="w-4 h-4 text-[#e67e22]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">Total Kunjungan</p>
                  <p className="text-[14px] font-black text-[#111827]">{totalVisits}x</p>
                </div>
              </div>
              <div className="bg-white rounded-[14px] p-3 flex items-center gap-2.5 shadow-sm border border-gray-100/50">
                <div className="w-8 h-8 rounded-[10px] bg-[#1d3866]/10 flex items-center justify-center shrink-0">
                  <Icons.Reward className="w-4 h-4 text-[#1d3866]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">Reward Ditukar</p>
                  <p className="text-[14px] font-black text-[#111827]">{rewardsClaimed}x</p>
                </div>
              </div>
            </div>

            {/* Navigasi Tab Mobile (Dengan Animasi Morph Framer Motion) */}
            <div className="bg-gray-100/80 p-1.5 rounded-full flex md:hidden border border-gray-200/60 mt-4 relative z-0">
              {["reward", "history"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-1 py-3 rounded-full text-[13px] font-extrabold transition-colors relative z-10 ${activeTab === tab ? "text-[#1d3866]" : "text-gray-400 hover:text-gray-500"}`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1] border border-gray-200/40"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab === "reward" ? "Katalog Reward" : "Riwayat Transaksi"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Kanan (Reward) */}
          <div className={`mt-5 md:mt-0 md:absolute md:inset-y-0 md:right-0 md:w-[calc(50%-12px)] flex-col ${activeTab === "reward" ? "flex" : "hidden md:flex"}`}>
            
            <AnimatePresence>
              {redeemed && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#6b8e4e]/10 border-[1.5px] border-[#6b8e4e] rounded-xl p-3 flex items-center gap-2.5 mb-3 shrink-0">
                  <Icons.Success className="w-6 h-6 shrink-0 text-[#6b8e4e]" />
                  <div>
                    <p className="text-[12px] font-extrabold text-[#6b8e4e]">Reward berhasil diklaim!</p>
                    <p className="text-[10px] font-semibold text-[#6b8e4e]/80">Kode terkirim ke WhatsApp. Tunjukkan ke kasir.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-red-500 text-[11px] text-center font-semibold bg-red-50 py-2 rounded-lg mb-3 shrink-0">{error}</p>}

            <div className="flex flex-col flex-1 min-h-0">
              <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 shrink-0">Reward Tersedia</div>
              <div className="flex flex-col justify-start gap-2.5 flex-1 min-h-0 overflow-y-auto pr-2 max-h-[350px] md:max-h-none" style={{ scrollbarWidth: 'thin' }}>
                {(customer.allRewards || []).map((r) => (
                  <RewardCard key={r.id} reward={r} currentPoints={points} onRedeem={handleRedeem} loading={loading} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Riwayat (History) */}
        <div className={`w-full md:border-t border-gray-200/60 md:pt-6 ${activeTab === "history" ? "block mt-5" : "hidden md:block md:mt-8"}`}>
          <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Riwayat Transaksi</div>
          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[11px] font-medium bg-white rounded-xl">Belum ada transaksi</div>
          ) : (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] md:max-h-[500px] overflow-y-auto pr-2" 
              style={{ scrollbarWidth: 'thin' }}
            >
              {history.map((h, i) => {
                const isEarn = h.points > 0;
                return (
                  <div key={i} className="bg-white rounded-[14px] p-3.5 flex items-center gap-3 shadow-sm border border-gray-100/50">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${isEarn ? "bg-[#6b8e4e]/10" : "bg-red-500/10"}`}>
                      {isEarn ? <Icons.Earn className="w-[18px] h-[18px] text-[#6b8e4e]" /> : <Icons.Redeem className="w-[18px] h-[18px] text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#111827] truncate">{h.note}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{formatDate(h.createdAt)}</p>
                    </div>
                    <div className={`text-[15px] font-black whitespace-nowrap ${isEarn ? "text-[#6b8e4e]" : "text-red-500"}`}>
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
  );
};

const LoyaltyPage = () => {
  const [customer, setCustomer] = useState(null);
  return (
    <FontWrapper>
      <div className="min-h-screen bg-[#f8f9f5] flex items-start justify-center pt-[130px] lg:pt-[120px] pb-12 px-4">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!customer ? <PhoneInput key="input" onFound={setCustomer} /> : <Dashboard key="dash" customer={customer} onBack={() => setCustomer(null)} />}
          </AnimatePresence>
        </div>
      </div>
    </FontWrapper>
  );
};

export default LoyaltyPage;