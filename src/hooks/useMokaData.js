// src/hooks/useMokaData.js
// Production  → fetch dari /.netlify/functions/moka-items (live Moka data)
// Development → import dari src/data/mokaMap.json (hasil generate moka-test-data.py)
//
// Cara setup dev:
//   1. python3 moka-test-data.py
//   2. mv mokaMap.json src/data/mokaMap.json
//   3. npm run dev  → variants & modifiers langsung ada

import { useState, useEffect } from "react";
import { menuItems as localMenu } from "../data/menuData";

const IS_DEV = import.meta.env.DEV;

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
  if (IS_DEV) {
    // Dev: pakai file lokal supaya tidak perlu Netlify Functions
    try {
      const raw = await import("../data/mokaMap.json");
      const mokaMapRaw = raw.default ?? raw;
      // Keys di JSON adalah string, convert ke number
      const map = {};
      Object.entries(mokaMapRaw).forEach(([id, mokaItem]) => {
        map[Number(id)] = mokaItem;
      });
      const n = Object.keys(map).length;
      console.log(`%c[Moka] Dev: loaded ${n} items from mokaMap.json ✓`, "color:#22c55e;font-weight:bold");
      return map;
    } catch {
      console.warn(
        "[Moka] mokaMap.json tidak ditemukan di src/data/\n" +
        "Jalankan: python3 moka-test-data.py → lalu pindahkan ke src/data/mokaMap.json"
      );
      return {};
    }
  }

  // Production: fetch live dari Netlify Function
  const res = await fetch("/.netlify/functions/moka-items");
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || `moka-items error ${res.status}`);
  }
  const data = await res.json();
  return buildMapFromMokaItems(data.items ?? []);
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