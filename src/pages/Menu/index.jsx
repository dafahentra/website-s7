// src/pages/Menu/index.jsx
// Halaman menu utama.
//
// Perubahan utama:
// - Banner peringatan kalau ada item missing atau sinkronisasi POS gagal.
// - canCheckout flag untuk disable alur checkout saat data POS belum siap.
// - Tombol reload kalau sinkronisasi gagal.

import React, { useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SEO from "../../components/SEO";
import CategorySidebar from "./CategorySidebar";
import CategoryIconBar from "./CategoryIconBar";
import ProductSlider from "./ProductSlider";
import ProductGrid from "./ProductGrid";
import CartSidebar from "./CartSidebar";
import AddToCartModal from "./AddToCartModal";
import { menuCategories } from "../../data/menuCategories";
import { menuItems } from "../../data/menuData";
import { useMokaData } from "../../hooks/useMokaData";
import { useMokaCheckout } from "../../hooks/useMokaCheckout";
import { useStoreStatus } from "../../hooks/useStoreStatus";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

// ── Floating Cart Button ──────────────────────────────────────────────────────
const FloatingCartButton = React.memo(
  ({ totalItems, totalPrice, onClick, disabled }) => (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          whileHover={disabled ? {} : { scale: 1.03 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          onClick={onClick}
          disabled={disabled}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-3 px-5 py-3.5 rounded-full text-white font-bold shadow-2xl lg:bottom-8 lg:right-8 disabled:opacity-60"
          style={{
            background: disabled
              ? "linear-gradient(135deg,#9ca3af,#6b7280)"
              : "linear-gradient(135deg,#FF6B35,#e85d2a)",
          }}
        >
          <div className="relative">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <motion.span
              key={totalItems}
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-white text-brand-orange text-xs font-black rounded-full flex items-center justify-center"
            >
              {totalItems}
            </motion.span>
          </div>
          <span className="text-sm font-bold">Rp{totalPrice}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
);
FloatingCartButton.displayName = "FloatingCartButton";

// ── Banner Status POS ────────────────────────────────────────────────────────
const POSStatusBanner = ({ mokaError, missingCount, onReload }) => {
  if (!mokaError && (!missingCount || missingCount === 0)) return null;

  return (
    <div className="mx-4 my-3 space-y-2">
      {mokaError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <span>Sinkronisasi POS gagal: {mokaError}</span>
          </div>
          <button
            onClick={onReload}
            className="underline font-semibold flex-shrink-0"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!mokaError && missingCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
          {missingCount} menu belum tersinkron dengan POS dan otomatis
          ter-disable. Hubungi admin kalau ini tidak sengaja.
        </div>
      )}
    </div>
  );
};

// ── Menu Page ─────────────────────────────────────────────────────────────────
const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("Espresso Based");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const {
    mokaMap,
    loading: mokaLoading,
    error: mokaError,
    missing,
    reload: reloadMoka,
  } = useMokaData();
  const { checkout, submitting } = useMokaCheckout();
  const { isOpen, unavailableItems } = useStoreStatus();

  // Bisa checkout kalau: data POS ter-load tanpa error dan map tidak kosong
  const canCheckout =
    !mokaLoading &&
    !mokaError &&
    mokaMap &&
    Object.keys(mokaMap).length > 0;

  const isItemUnavailable = useCallback(
    (localId) => {
      const mokaEntry = mokaMap[localId];
      // Item yang tidak ketemu di Moka = otomatis unavailable
      if (!mokaEntry?.id) return true;
      return unavailableItems.includes(String(mokaEntry.id));
    },
    [mokaMap, unavailableItems]
  );

  const currentItems = useMemo(
    () => menuItems[activeCategory] || [],
    [activeCategory]
  );

  const handleAddToCart = useCallback(
    (item) => {
      if (!isOpen || isItemUnavailable(item.id)) return;
      setPendingItem(item);
    },
    [isOpen, isItemUnavailable]
  );

  const handleConfirmAdd = useCallback(
    ({
      item,
      mokaItemId,
      mokaVariantId,
      mokaVariantName,
      mokaVariantSku,
      mokaCategoryId,
      mokaCategoryName,
      mokaModifiers,
      qty,
      unitPrice,
    }) => {
      // Guard tambahan: jangan pernah push cart entry tanpa mokaItemId
      if (!mokaItemId) {
        console.error("[handleConfirmAdd] mokaItemId null untuk:", item?.name);
        alert("Item tidak bisa ditambahkan. Refresh halaman.");
        return;
      }

      const modsKey = JSON.stringify(mokaModifiers);
      const key = `${item.id}-${mokaVariantId ?? "none"}-${modsKey}`;
      setCart((prev) => {
        const idx = prev.findIndex((e) => e.key === key);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [
          ...prev,
          {
            key,
            itemId: item.id,
            itemName: item.name,
            image: item.image,
            mokaItemId,
            mokaVariantId,
            mokaVariantName,
            mokaVariantSku,
            mokaCategoryId,
            mokaCategoryName,
            mokaModifiers,
            qty,
            unitPrice,
          },
        ];
      });
    },
    []
  );

  const handleDecrement = useCallback((item) => {
    const id = typeof item === "string" ? item : null;
    const itemId = item?.id ?? null;
    setCart((prev) => {
      if (id) {
        return prev
          .map((e) => (e.key === id ? { ...e, qty: e.qty - 1 } : e))
          .filter((e) => e.qty > 0);
      }
      const idx = [...prev]
        .reverse()
        .findIndex((e) => String(e.itemId) === String(itemId));
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      const next = [...prev];
      if (next[realIdx].qty <= 1) next.splice(realIdx, 1);
      else next[realIdx] = { ...next[realIdx], qty: next[realIdx].qty - 1 };
      return next;
    });
  }, []);

  const handleSidebarIncrement = useCallback((key) => {
    setCart((prev) =>
      prev.map((e) => (e.key === key ? { ...e, qty: e.qty + 1 } : e))
    );
  }, []);

  const handleRemove = useCallback((key) => {
    setCart((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const handleCheckout = useCallback(
    async (customerInfo = {}) => {
      if (!isOpen) {
        alert("Toko sedang tutup. Order tidak dapat diproses.");
        return;
      }
      if (!canCheckout) {
        alert("Data menu belum tersinkron. Refresh halaman dulu.");
        return;
      }
      try {
        const result = await checkout(cart, customerInfo);
        if (result?.success) {
          setCart([]);
          setCartOpen(false);
        }
      } catch (e) {
        const msg = e.message || "";
        if (msg.includes("dibatalkan")) return;
        if (msg.includes("tapi order gagal masuk")) {
          alert(msg);
          return;
        }
        alert(`Pembayaran gagal: ${msg}`);
      }
    },
    [cart, checkout, isOpen, canCheckout]
  );

  const { cartTotalItems, cartTotalPrice } = useMemo(
    () => ({
      cartTotalItems: cart.reduce((s, e) => s + e.qty, 0),
      cartTotalPrice: fmt(cart.reduce((s, e) => s + e.unitPrice * e.qty, 0)),
    }),
    [cart]
  );

  const handleCategoryChange = useCallback((id) => {
    setActiveCategory(id);
    setCurrentIndex(0);
    setDirection(0);
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((p) => (p + 1) % currentItems.length);
  }, [currentItems.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((p) => (p - 1 + currentItems.length) % currentItems.length);
  }, [currentItems.length]);

  const handleProductClick = useCallback(
    (itemId) => {
      const idx = currentItems.findIndex((i) => i.id === itemId);
      setCurrentIndex(idx);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [currentItems]
  );

  const cartProps = {
    cart,
    onAddToCart: handleAddToCart,
    onDecrement: handleDecrement,
    isOpen,
    isItemUnavailable,
  };

  return (
    <>
      <SEO
        title="Menu - SECTOR SEVEN"
        description="Explore our menu of hybrid specialty between coffee & matcha drinks at SECTOR SEVEN."
        keywords="sector seven menu, coffee menu yogyakarta"
        url="/menu"
        image="/og-image.jpg"
      />

      <div className="min-h-screen bg-white">
        {/* Banner status POS */}
        <POSStatusBanner
          mokaError={mokaError}
          missingCount={missing?.length || 0}
          onReload={reloadMoka}
        />

        <div className="hidden lg:flex">
          <CategorySidebar
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <div className="flex-1 ml-64">
            <ProductSlider
              items={currentItems}
              currentIndex={currentIndex}
              activeCategory={activeCategory}
              direction={direction}
              onNext={handleNext}
              onPrev={handlePrev}
              onIndexChange={setCurrentIndex}
              onDirectionChange={setDirection}
              {...cartProps}
            />
            <ProductGrid
              items={currentItems}
              activeCategory={activeCategory}
              onProductClick={handleProductClick}
              {...cartProps}
            />
          </div>
        </div>

        <div className="lg:hidden">
          <CategoryIconBar
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <ProductSlider
            items={currentItems}
            currentIndex={currentIndex}
            activeCategory={activeCategory}
            direction={direction}
            onNext={handleNext}
            onPrev={handlePrev}
            onIndexChange={setCurrentIndex}
            onDirectionChange={setDirection}
            isMobile
            {...cartProps}
          />
          <ProductGrid
            items={currentItems}
            activeCategory={activeCategory}
            onProductClick={handleProductClick}
            isMobile
            {...cartProps}
          />
        </div>
      </div>

      {/* Floating cart — tetap muncul meski toko tutup supaya pelanggan bisa lihat/hapus cart */}
      <FloatingCartButton
        totalItems={cartTotalItems}
        totalPrice={cartTotalPrice}
        onClick={() => setCartOpen(true)}
        disabled={!canCheckout}
      />

      <AnimatePresence>
        {cartOpen && (
          <CartSidebar
            cart={cart}
            onClose={() => setCartOpen(false)}
            onIncrement={handleSidebarIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onCheckout={handleCheckout}
            isOpen={isOpen}
            isItemUnavailable={isItemUnavailable}
            submitting={submitting}
            canCheckout={canCheckout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingItem && (
          <AddToCartModal
            item={pendingItem}
            mokaItem={mokaMap[pendingItem.id] ?? null}
            mokaLoading={mokaLoading}
            mokaError={mokaError}
            onClose={() => setPendingItem(null)}
            onConfirm={handleConfirmAdd}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;