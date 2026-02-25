// src/hooks/useMokaData.js
// Production + netlify dev → fetch dari /.netlify/functions/moka-items (live Moka data)
// Local offline dev        → import dari src/data/mokaMap.json
//
// Mode ditentukan oleh env var VITE_USE_LOCAL_MOKA:
//   VITE_USE_LOCAL_MOKA=true  → pakai mokaMap.json (offline, tanpa Netlify)
//   (tidak di-set)            → selalu fetch dari /.netlify/functions/moka-items
//
// Cara setup:
//   netlify dev               → langsung jalan, pakai live Moka data ✓
//   npm run dev (tanpa token) → buat .env.local → VITE_USE_LOCAL_MOKA=true
//                               lalu: python3 moka-test-data.py
//                                     mv mokaMap.json src/data/mokaMap.json

import { useState, useEffect } from "react";
import { menuItems as localMenu } from "../data/menuData";

// Hanya pakai file lokal jika VITE_USE_LOCAL_MOKA=true secara eksplisit
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_MOKA === "true";

// Module-level cache — survives re-renders & route changes
let _cachedMap    = null;
let _fetchPromise = null;

function buildMapFromMokaItems(mokaItems) {
  const byName = {};
  mokaItems.forEach((mi) => {
    byName[mi.name.toLowerCase().trim()] = mi;
  });
  const map = {};
  Object.values(localMenu).flat().forEach((local) => {
    const moka = byName[local.name.toLowerCase().trim()];
    if (moka) map[local.id] = moka;
  });
  return map;
}

async function loadMap() {
  if (USE_LOCAL) {
    // Offline dev: pakai file lokal (VITE_USE_LOCAL_MOKA=true)
    // Path dibuat dinamis agar Vite tidak mencoba resolve saat build
    try {
      const jsonPath   = ["../data/", "mokaMap.json"].join("");
      const raw        = await import(/* @vite-ignore */ jsonPath);
      const mokaMapRaw = raw.default ?? raw;
      const map        = {};
      Object.entries(mokaMapRaw).forEach(([id, mokaItem]) => {
        map[Number(id)] = mokaItem;
      });
      const n = Object.keys(map).length;
      console.log(
        `%c[Moka] Local: loaded ${n} items dari mokaMap.json ✓`,
        "color:#f59e0b;font-weight:bold"
      );
      return map;
    } catch {
      console.warn(
        "[Moka] mokaMap.json tidak ditemukan di src/data/\n" +
        "Jalankan: python3 moka-test-data.py → lalu pindahkan ke src/data/mokaMap.json"
      );
      return {};
    }
  }

  // Production & netlify dev: fetch dari Netlify Function
  const mode = import.meta.env.DEV ? "netlify dev" : "production";
  console.log(`%c[Moka] Fetching live data (${mode})…`, "color:#3b82f6;font-weight:bold");

  const res = await fetch("/.netlify/functions/moka-items");
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || `moka-items error ${res.status}`);
  }
  const data = await res.json();
  const map  = buildMapFromMokaItems(data.items ?? []);
  console.log(
    `%c[Moka] Live: loaded ${Object.keys(map).length} items dari Moka ✓`,
    "color:#22c55e;font-weight:bold"
  );
  return map;
}

export function useMokaData() {
  const [mokaMap, setMokaMap] = useState(_cachedMap ?? {});
  const [loading, setLoading] = useState(!_cachedMap);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (_cachedMap) {
      setMokaMap(_cachedMap);
      setLoading(false);
      return;
    }
    if (!_fetchPromise) _fetchPromise = loadMap();

    _fetchPromise
      .then((map) => { _cachedMap = map; setMokaMap(map); })
      .catch((e)  => { setError(e.message); _fetchPromise = null; })
      .finally(()  => setLoading(false));
  }, []);

  const refresh = () => {
    _cachedMap = null; _fetchPromise = null;
    setLoading(true); setError(null);
    _fetchPromise = loadMap();
    _fetchPromise
      .then((map) => { _cachedMap = map; setMokaMap(map); })
      .catch((e)  => { setError(e.message); _fetchPromise = null; })
      .finally(()  => setLoading(false));
  };

  return { mokaMap, loading, error, refresh };
}