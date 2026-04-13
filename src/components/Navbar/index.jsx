// components/Navbar/index.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useScroll } from "framer-motion";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransformed, setIsTransformed] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const isMenuPage = location.pathname === "/menu";
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsTransformed(latest >= 400);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Tutup menu otomatis saat pindah page — fix blank screen bug
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => setMobileMenuOpen((prev) => !prev);
  const handleMenuClose  = () => setMobileMenuOpen(false);

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
        navRef={navRef}
        isMenuPage={isMenuPage}
      />
    </>
  );
};

export default Navbar;