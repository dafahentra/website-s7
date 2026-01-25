// components/Navbar/index.jsx
import React, { useState } from "react";
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

return (
<>
    {/* Wrapper Container */}
    <div className="w-full fixed top-0 left-0 z-50 flex justify-center pointer-events-none">
    <NavbarDesktop onMenuToggle={handleMenuToggle} />
    </div>

    {/* Mobile Menu Overlay */}
    <NavbarMobile isOpen={mobileMenuOpen} onClose={handleMenuClose} />
</>
);
};

export default Navbar;