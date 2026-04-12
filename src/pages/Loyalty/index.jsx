// src/pages/Loyalty/index.jsx
// Customer loyalty portal — cek poin, lihat reward, redeem via WA

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fmt   = (n) => new Intl.NumberFormat("id-ID").format(n);
const fmtRp = (n) => `Rp${fmt(n)}`;

// ── Phone Input ───────────────────────────────────────────────────────────────
const PhoneInput = ({ onFound }) => {
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCheck = async () => {
    if (!phone.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/.netlify/functions/loyalty-get?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      onFound({ ...data, inputPhone: phone.trim() });
    } catch {
      setError("Gagal mengambil data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#1d3866,#2d4f8a)" }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-brand-navy">Sector Seven Loyalty</h1>
        <p className="text-gray-400 text-sm mt-1">Masukkan nomor HP untuk cek poin</p>
      </div>

      <div className="space-y-3">
        <input
          type="tel" value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          placeholder="Nomor WhatsApp (08xxx)"
          className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none focus:border-brand-orange focus:bg-white transition-all"
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          onClick={handleCheck} disabled={loading || !phone.trim()}
          className="w-full py-3.5 rounded-full text-white font-black text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#f39248,#e67e22)" }}
        >
          {loading ? "Mengecek..." : "Cek Poin →"}
        </button>
      </div>

      <div className="mt-8 bg-orange-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-2 uppercase tracking-wider">Cara Dapat Poin</p>
        <p className="text-xs text-gray-600">Setiap Rp10.000 belanja = <strong>10 poin</strong></p>
        <p className="text-xs text-gray-400 mt-1">Berlaku untuk online & offline order</p>
      </div>
    </motion.div>
  );
};

// ── Reward Card ───────────────────────────────────────────────────────────────
const RewardCard = ({ reward, currentPoints, onRedeem, loading }) => {
  const available = currentPoints >= reward.points;
  return (
    <div className={`rounded-2xl p-4 border-2 transition-all ${available ? "border-brand-orange bg-orange-50/40" : "border-gray-100 bg-gray-50 opacity-50"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="font-bold text-brand-navy text-sm">{reward.label}</p>
          <p className="text-gray-400 text-xs mt-0.5">{reward.description}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <svg className="w-3.5 h-3.5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-brand-orange font-bold text-xs">{reward.points} pts</span>
          </div>
        </div>
        {available && (
          <button
            onClick={() => onRedeem(reward)}
            disabled={loading}
            className="px-4 py-2 rounded-full text-white font-bold text-xs flex-shrink-0 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f39248,#e67e22)" }}
          >
            Redeem
          </button>
        )}
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({ customer, onBack }) => {
  const [points,    setPoints]    = useState(customer.points || 0);
  const [redeemed,  setRedeemed]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleRedeem = async (reward) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/.netlify/functions/loyalty-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customer.phone || customer.inputPhone, rewardId: reward.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPoints(data.pointsLeft);
      setRedeemed(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h2 className="font-black text-brand-navy text-lg leading-tight">{customer.name || "Member"}</h2>
          <p className="text-gray-400 text-xs">{customer.phone || customer.inputPhone}</p>
        </div>
      </div>

      {/* Points card */}
      <div className="rounded-3xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1d3866 0%,#2d4f8a 100%)" }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#f39248,transparent)" }}/>
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Total Poin Kamu</p>
        <motion.p key={points} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-5xl font-black mb-1">
          {points}
        </motion.p>
        <p className="text-white/50 text-xs">Rp10.000 = 10 poin</p>
        {!customer.found && (
          <p className="text-orange-300 text-xs mt-2">✨ Daftar otomatis saat transaksi pertama!</p>
        )}
      </div>

      {/* Redeem success */}
      <AnimatePresence>
        {redeemed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-4 mb-6 border-2 border-green-400 bg-green-50"
          >
            <p className="text-green-700 font-bold text-sm">✅ {redeemed.reward} berhasil diklaim!</p>
            <p className="text-green-600 text-xs mt-1">Kode dikirim ke WhatsApp kamu.</p>
            <div className="bg-white rounded-xl px-4 py-2 mt-2 text-center">
              <p className="text-xs text-gray-400">Tunjukkan ke kasir:</p>
              <p className="font-black text-brand-navy text-lg tracking-widest">{redeemed.mokaDiscountName}</p>
            </div>
            <p className="text-green-600 text-xs text-center mt-1">Berlaku hari ini</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

      {/* Rewards */}
      <h3 className="font-bold text-brand-navy text-sm mb-3">Reward Tersedia</h3>
      <div className="space-y-3 mb-6">
        {(customer.allRewards || []).map((r) => (
          <RewardCard key={r.id} reward={r} currentPoints={points} onRedeem={handleRedeem} loading={loading} />
        ))}
      </div>

      {/* History */}
      {(customer.history || []).length > 0 && (
        <>
          <h3 className="font-bold text-brand-navy text-sm mb-3">Riwayat</h3>
          <div className="space-y-2">
            {customer.history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-gray-700 text-xs font-medium">{h.note}</p>
                  <p className="text-gray-400 text-[10px]">
                    {h.createdAt
                      ? (() => {
                          const d = new Date(h.createdAt);
                          return isNaN(d.getTime())
                            ? String(h.createdAt).split(",")[0]
                            : d.toLocaleDateString("id-ID");
                        })()
                      : "-"}
                  </p>
                </div>
                <span className={`font-bold text-sm ${h.points > 0 ? "text-green-500" : "text-red-400"}`}>
                  {h.points > 0 ? "+" : ""}{h.points}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const LoyaltyPage = () => {
  const [customer, setCustomer] = useState(null);
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <AnimatePresence mode="wait">
        {!customer
          ? <PhoneInput key="input" onFound={setCustomer} />
          : <Dashboard key="dash" customer={customer} onBack={() => setCustomer(null)} />
        }
      </AnimatePresence>
    </div>
  );
};

export default LoyaltyPage;