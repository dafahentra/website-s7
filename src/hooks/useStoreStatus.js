// src/hooks/useStoreStatus.js
import { useState, useEffect, useCallback } from "react";

const STORE_STATUS_URL = "https://sectorseven.space/.netlify/functions/store-status";
const POLL_INTERVAL    = 60_000;

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
    fetch_();
    const id = setInterval(fetch_, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetch_]);

  return { isOpen, unavailableItems };
}