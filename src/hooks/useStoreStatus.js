// src/hooks/useStoreStatus.js
import { useState, useEffect, useCallback } from "react";

const STORE_STATUS_URL = "https://sectorseven.space/.netlify/functions/store-status";
const POLL_INTERVAL    = 5_000; // 5 detik

export function useStoreStatus() {
  const [isOpen,           setIsOpen]           = useState(true);  // optimistic
  const [unavailableItems, setUnavailableItems] = useState([]);

  const fetch_ = useCallback(async () => {
    try {
      const res  = await fetch(STORE_STATUS_URL);
      const data = await res.json();
      setIsOpen(data.isOpen !== false);
      setUnavailableItems(data.unavailableItems?.map(String) ?? []);
    } catch (e) {
      console.error("[useStoreStatus]", e);
    }
  }, []);

  useEffect(() => {
    // Fetch langsung saat mount
    fetch_();

    // Poll setiap 5 detik
    const id = setInterval(fetch_, POLL_INTERVAL);

    // Fetch ulang saat tab aktif kembali (user switch tab / buka browser)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetch_();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Fetch ulang saat koneksi internet pulih
    window.addEventListener("online", fetch_);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", fetch_);
    };
  }, [fetch_]);

  return { isOpen, unavailableItems };
}