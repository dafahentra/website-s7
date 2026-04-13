// components/Navbar/index.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useScroll } from "framer-motion";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransformed, setIsTransformed] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();

  const isMenuPage = location.pathname === "/menu";
  const { scrollY } = useScroll();

  const updateAnchorRect = useCallback(() => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setAnchorRect({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Update saat scroll
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsTransformed(latest >= 400);
      updateAnchorRect();
    });
    return () => unsubscribe();
  }, [scrollY, updateAnchorRect]);

  // Update saat resize
  useEffect(() => {
    window.addEventListener("resize", updateAnchorRect);
    return () => window.removeEventListener("resize", updateAnchorRect);
  }, [updateAnchorRect]);

  // Update saat pertama kali mount (agar anchorRect tidak null)
  useEffect(() => {
    // Tunggu satu frame agar motion.nav sudah render dengan style-nya
    const raf = requestAnimationFrame(updateAnchorRect);
    return () => cancelAnimationFrame(raf);
  }, [updateAnchorRect]);

  const handleMenuToggle = () => {
    updateAnchorRect();
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div
        className={`w-full fixed top-0 left-0 flex justify-center pointer-events-none ${
          mobileMenuOpen ? "z-[35]" : "z-50"
        }`}
      >
        <NavbarDesktop
          navRef={navRef}
          onMenuToggle={handleMenuToggle}
          isMenuPage={isMenuPage}
          isTransformed={isTransformed}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>

      <NavbarMobile
        isOpen={mobileMenuOpen}
        onClose={handleMenuClose}
        isTransformed={isTransformed}
        anchorRect={anchorRect}
      />
    </>
  );
};

export default Navbar;