// components/Navbar/index.jsx - PERFECT AS IS ✅
import React, { useState, useEffect } from "react";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Lock body scroll ketika mobile menu terbuka
  useEffect(() => {
    if (mobileMenuOpen) {
      // Simpan scroll position dan overflow style
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Restore overflow
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup saat component unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Wrapper Container */}
      <div className={`w-full fixed top-0 left-0 flex justify-center pointer-events-none ${mobileMenuOpen ? 'z-[35]' : 'z-50'}`}>
        <NavbarDesktop onMenuToggle={handleMenuToggle} />
      </div>

      {/* Mobile Menu Overlay */}
      <NavbarMobile isOpen={mobileMenuOpen} onClose={handleMenuClose} />
    </>
  );
};

export default Navbar;
