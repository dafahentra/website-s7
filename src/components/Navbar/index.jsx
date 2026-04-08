// components/Navbar/index.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cek apakah sedang di halaman /menu
  const isMenuPage = location.pathname === "/menu";

  const handleMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Lock body scroll ketika mobile menu terbuka
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Wrapper Container */}
      <div
        className={`w-full fixed top-0 left-0 flex justify-center pointer-events-none ${
          mobileMenuOpen ? "z-[35]" : "z-50"
        }`}
      >
        <NavbarDesktop
          onMenuToggle={handleMenuToggle}
          isMenuPage={isMenuPage}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <NavbarMobile isOpen={mobileMenuOpen} onClose={handleMenuClose} />
    </>
  );
};

export default Navbar;