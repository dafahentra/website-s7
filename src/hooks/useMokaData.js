// src/hooks/useMokaData.js
// Fetch semua item dari Moka via /.netlify/functions/moka-items
// Build lookup map: { [menuData.id]: mokaItem }
//
// Strategi match (urut prioritas):
//   1. mokaGuid (permanen, tidak pernah berubah)
//   2. normalized name (fallback kalau mokaGuid lupa diisi)

import { useState, useEffect, useCallback } from "react";
import { fetchItems } from "../services/mokaApi";
import { menuItems } from "../data/menuData";

// Normalisasi nama untuk fallback match:
// - lowercase
// - trim
// - collapse whitespace
// - strip karakter non-alphanum/spasi (mis. em-dash, tanda kutip)
const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");

// Flatten menuItems jadi array { id, guid, nameKey }
function flatMenuEntries() {
  return Object.values(menuItems)
    .flat()
    .map((e) => ({
      id: e.id,
      guid: e.mokaGuid || null,
      nameKey: normalize(e.name),
    }));
}

export function useMokaData() {
  const [mokaMap, setMokaMap] = useState({}); // { [menuId]: mokaItem }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [missing, setMissing] = useState([]); // daftar menuId yang tidak ketemu

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await fetchItems();

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
          "Moka items kosong. Cek token, outlet_id, atau pagination backend."
        );
      }

      // Build 2 lookup dari response Moka
      const byGuid = new Map();
      const byName = new Map();
      items.forEach((it) => {
        if (it.is_deleted) return;
        if (it.guid) byGuid.set(it.guid, it);
        byName.set(normalize(it.name), it);
      });

      // Map menuData.id → Moka item
      const map = {};
      const notFound = [];

      flatMenuEntries().forEach(({ id, guid, nameKey }) => {
        let hit = null;

        // 1. Prioritas: match by GUID (paling stabil)
        if (guid && byGuid.has(guid)) {
          hit = byGuid.get(guid);
        }
        // 2. Fallback: match by normalized name
        else if (byName.has(nameKey)) {
          hit = byName.get(nameKey);
        }

        if (hit) {
          map[id] = hit;
        } else {
          notFound.push(id);
        }
      });

      setMokaMap(map);
      setMissing(notFound);

      if (notFound.length > 0) {
        console.warn(
          "[useMokaData] menuId tanpa match Moka:",
          notFound,
          "→ item tersebut akan ter-disable di UI."
        );
      }
    } catch (err) {
      console.error("[useMokaData]", err);
      setError(err.message);
      setMokaMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { mokaMap, loading, error, missing, reload: load };
}