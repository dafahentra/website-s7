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

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsTransformed(latest >= 400);
      updateAnchorRect();
    });
    return () => unsubscribe();
  }, [scrollY, updateAnchorRect]);

  useEffect(() => {
    window.addEventListener("resize", updateAnchorRect);
    return () => window.removeEventListener("resize", updateAnchorRect);
  }, [updateAnchorRect]);

  const handleMenuToggle = () => {
    updateAnchorRect();
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Lock scroll hanya untuk mode full-screen
  const useFullScreen = !isTransformed || isMenuPage;
  useEffect(() => {
    if (mobileMenuOpen && useFullScreen) {
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${w}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [mobileMenuOpen, useFullScreen]);

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
        isMenuPage={isMenuPage}
        anchorRect={anchorRect}
      />
    </>
  );
};

export default Navbar;