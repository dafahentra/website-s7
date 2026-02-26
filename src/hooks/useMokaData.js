// src/hooks/useMokaData.js
// Fetches all items from Moka via mokaApi service layer.
// Builds a lookup map keyed by menuData numeric item ID.

import { useState, useEffect } from "react";
import { fetchItems } from "../services/mokaApi";

// Maps Moka item name (lowercase) → menuData numeric ID
const NAME_TO_MENU_ID = {
  "sectorize":              1,
  "americano":              2,
  "abericano":              3,
  "latte":                  4,
  "cappucino":              5,
  "white vanilla":          6,
  "buttery":                7,
  "hazelnutz":              8,
  "palmer":                 9,
  "caramelted":             10,
  "pure matcha":            11,
  "green flag":             12,
  "red flag":               13,
  "dirty matcha":           14,
  "sea salt matcha":        15,
  "chocolate":              16,
  "red velvet":             17,
  "wizzie berry":           18,
  "croissant almond":       19,
  "cinnamon roll":          20,
  "apple danish":           21,
  "plain":                  22,
  "double choco":           23,
  "blueberry cream cheese": 24,
};

export function useMokaData() {
  const [mokaMap, setMokaMap] = useState({});  // { [menuId]: mokaItem }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchItems();

        if (cancelled) return;

        // Build map: menuData numeric ID → full Moka item object
        const map = {};
        items.forEach((mokaItem) => {
          const key    = (mokaItem.name || "").toLowerCase().trim();
          const menuId = NAME_TO_MENU_ID[key];
          if (menuId !== undefined) map[menuId] = mokaItem;
        });

        setMokaMap(map);
      } catch (err) {
        if (!cancelled) {
          console.error("[useMokaData]", err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { mokaMap, loading, error };
}