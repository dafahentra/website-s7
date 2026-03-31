// src/pages/MokaCallback.jsx
// Menangani redirect dari Moka OAuth.
// Tambahkan route ini di App.jsx:
//   <Route path="/callback" element={<MokaCallback />} />

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const REDIRECT_URI = "https://sectorseven.space/callback";

const STATUS = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function MokaCallback() {
  const [status, setStatus]   = useState(STATUS.LOADING);
  const [tokens, setTokens]   = useState({ access: "", refresh: "" });
  const [meta,   setMeta]     = useState({ expires: "", scope: "" });
  const [errMsg, setErrMsg]   = useState("");
  const [copied, setCopied]   = useState({ access: false, refresh: false });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const error  = params.get("error");

    if (error) {
      setErrMsg("Moka error: " + error);
      setStatus(STATUS.ERROR);
      return;
    }

    if (!code) {
      setErrMsg(
        "Tidak ada authorization code di URL. Pastikan kamu mengakses halaman ini melalui redirect dari Moka."
      );
      setStatus(STATUS.ERROR);
      return;
    }

    fetch("/.netlify/functions/moka-exchange-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Exchange token gagal");
        setTokens({ access: data.access_token || "", refresh: data.refresh_token || "" });
        setMeta({
          expires: data.expires_in ? formatExpiry(data.expires_in) : "-",
          scope:   data.scope || "-",
        });
        setStatus(STATUS.SUCCESS);
        window.history.replaceState({}, "", "/callback");
      })
      .catch((err) => {
        setErrMsg(err.message);
        setStatus(STATUS.ERROR);
      });
  }, []);

  function formatExpiry(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return days + " hari";
    if (hours > 0) return hours + " jam";
    return seconds + "s";
  }

  function copyToken(type) {
    const val = type === "refresh" ? tokens.refresh : tokens.access;
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 1500);
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f2ef] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-8">
          <span className="text-[#f39248]">Sector Seven</span> — Moka Callback
        </p>

        {/* Loading */}
        {status === STATUS.LOADING && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-[#f39248] rounded-full animate-spin mx-auto mb-5" />
            <p className="text-gray-500 text-sm">Menukar authorization code ke access token...</p>
          </div>
        )}

        {/* Success */}
        {status === STATUS.SUCCESS && (
          <div>
            <h1 className="text-3xl font-bold text-[#1d3866] mb-2">Token Berhasil</h1>
            <p className="text-gray-500 text-sm mb-8">
              Salin nilai di bawah ke Netlify environment variables, lalu redeploy site.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 border-l-4 border-[#f39248]">
              <TokenRow
                label="MOKA_REFRESH_TOKEN"
                value={tokens.refresh}
                copied={copied.refresh}
                onCopy={() => copyToken("refresh")}
              />
              <div className="my-5 h-px bg-gray-100" />
              <TokenRow
                label="MOKA_ACCESS_TOKEN"
                value={tokens.access}
                copied={copied.access}
                onCopy={() => copyToken("access")}
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetaCell label="Expires In" value={meta.expires} />
                <MetaCell label="Scope" value={meta.scope} />
              </div>
            </div>

            <div className="bg-[#1d3866]/5 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
              Simpan <code className="text-[#f39248] font-semibold">MOKA_REFRESH_TOKEN</code> dan{" "}
              <code className="text-[#f39248] font-semibold">MOKA_ACCESS_TOKEN</code> ke{" "}
              <strong className="text-[#1d3866]">Netlify Dashboard &rarr; Site &rarr; Environment Variables</strong>,
              lalu redeploy. Halaman ini tidak perlu diakses lagi setelah token tersimpan.
            </div>
          </div>
        )}

        {/* Error */}
        {status === STATUS.ERROR && (
          <div>
            <h1 className="text-3xl font-bold text-[#1d3866] mb-2">Otorisasi Gagal</h1>
            <p className="text-gray-500 text-sm mb-8">
              Terjadi kesalahan saat memproses authorization code.
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-400 mb-4">
              <p className="text-red-500 font-semibold text-sm mb-3">{errMsg}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Kemungkinan penyebab: code sudah kadaluarsa, redirect URI tidak cocok, atau
                Netlify function belum terdeploy.
              </p>
            </div>

            <Link
              to="/moka-setup"
              className="inline-block bg-[#1d3866] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#f39248] transition-colors"
            >
              Ulangi dari Setup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenRow({ label, value, copied, onCopy }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <div className="bg-[#f4f2ef] rounded-xl px-4 py-3 font-mono text-xs text-[#1d3866] break-all select-all leading-relaxed mb-2">
        {value || "-"}
      </div>
      <button
        onClick={onCopy}
        className="text-xs font-semibold text-[#f39248] hover:text-[#1d3866] transition-colors"
      >
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

function MetaCell({ label, value }) {
  return (
    <div className="bg-[#f4f2ef] rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#1d3866]">{value}</p>
    </div>
  );
}