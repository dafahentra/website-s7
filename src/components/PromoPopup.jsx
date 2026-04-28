// src/components/PromoPopup.jsx
// Popup promo — CTA di dalam gambar, gradient overlay di bawah.

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── KONFIGURASI ───────────────────────────────────────────────────────────────
import poster from "../assets/PopUpPoints.png";
const POSTER_IMAGE  = poster;
const CTA_LABEL     = "Klaim Poin Sekarang ";
const CTA_HREF      = "/menu";
const PROMO_CODE    = "DEPON50"; // ← kode diskon dari Moka (null = tidak ada)
// ─────────────────────────────────────────────────────────────────────────────

const PromoPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => setVisible(false);

  const handleCTA = () => {
    dismiss();
    const url = PROMO_CODE
      ? `${CTA_HREF}?promo=${encodeURIComponent(PROMO_CODE)}`
      : CTA_HREF;
    window.location.href = url;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
            onClick={dismiss}
          />

          {/* Popup */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{
              duration: 0.55,
              ease: [0.34, 1.56, 0.64, 1],
              exit: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className="fixed inset-0 z-[101] flex items-center justify-center px-6"
            onClick={dismiss}
          >
            <div
              style={{ width: "100%", maxWidth: "400px", position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Liquid Glass Close Button ── */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={dismiss}
                aria-label="Tutup"
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "-18px",
                  zIndex: 10,
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}
              >
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
                >
                  <path d="M1.5 1.5L14.5 14.5M14.5 1.5L1.5 14.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </motion.button>

              {/* ── Poster + CTA di dalam ── */}
              <div style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)",
                position: "relative",
              }}>
                {/* Gambar */}
                <img
                  src={POSTER_IMAGE}
                  alt="Promo Sector Seven"
                  draggable={false}
                  style={{
                    width: "100%",
                    display: "block",
                    maxHeight: "78dvh",
                    objectFit: "cover",
                    userSelect: "none",
                    WebkitUserDrag: "none",
                  }}
                />

                {/* Gradient overlay bawah */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "45%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                  pointerEvents: "none",
                }} />

                {/* CTA button di dalam */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "16px",
                    right: "16px",
                  }}
                >
                  <button
                    onClick={handleCTA}
                    style={{
                      width: "100%",
                      padding: "14px 24px",
                      borderRadius: "100px",
                      fontWeight: "800",
                      fontSize: "15px",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #f39248 0%, #e67e22 100%)",
                      boxShadow: "0 8px 24px rgba(243,146,72,0.5), 0 2px 8px rgba(0,0,0,0.2)",
                      letterSpacing: "-0.01em",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}

                  >
                    {CTA_LABEL} →
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;