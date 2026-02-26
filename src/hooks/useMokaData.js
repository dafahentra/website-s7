// src/hooks/useMokaData.js
// Fetches all items from Moka API via Netlify function.
// Builds a lookup map keyed by item name (lowercase) so mokaMap["sectorize"] works.
// Also exposes mokaMapById keyed by menuData item ID via nameToIdMap.

import { useState, useEffect } from "react";

// Maps menuData item IDs → Moka item name (lowercase) for lookup
const NAME_TO_MENU_ID = {
  "sectorize":            1,
  "americano":            2,
  "abericano":            3,
  "latte":                4,
  "cappucino":            5,
  "white vanilla":        6,
  "buttery":              7,
  "hazelnutz":            8,
  "palmer":               9,
  "caramelted":           10,
  "pure matcha":          11,
  "green flag":           12,
  "red flag":             13,
  "dirty matcha":         14,
  "sea salt matcha":      15,
  "chocolate":            16,
  "red velvet":           17,
  "wizzie berry":         18,
  "croissant almond":     19,
  "cinnamon roll":        20,
  "apple danish":         21,
  "plain":                22,
  "double choco":         23,
  "blueberry cream cheese": 24,
};

export function useMokaData() {
  const [mokaMap, setMokaMap]     = useState({});   // keyed by menuData item ID (number)
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/.netlify/functions/moka-items");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `HTTP ${res.status}`);
        }

        const { items } = await res.json();
        if (!Array.isArray(items)) throw new Error("Invalid response from moka-items");

        // Build map keyed by menuData numeric ID
        const map = {};
        items.forEach((mokaItem) => {
          const nameLower = (mokaItem.name || "").toLowerCase().trim();
          const menuId    = NAME_TO_MENU_ID[nameLower];
          if (menuId !== undefined) {
            map[menuId] = mokaItem;
          }
        });

        if (!cancelled) {
          setMokaMap(map);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useMokaData] fetch error:", err);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchItems();
    return () => { cancelled = true; };
  }, []);

  return { mokaMap, loading, error };
}