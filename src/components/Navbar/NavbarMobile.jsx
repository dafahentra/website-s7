// components/Navbar/NavbarMobile.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { menuItems, getWhatsAppLink, isActiveRoute } from "../../data/navbarData";

const NavbarMobile = ({ isOpen, onClose }) => {
const location = useLocation();
const whatsappLink = getWhatsAppLink();

  // Close mobile menu saat navigasi
const handleNavClick = () => {
    onClose();
};

return (
    <>
      {/* Backdrop Overlay */}
    {isOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/30 z-[38] lg:hidden"
        onClick={onClose}
        />
    )}

      {/* Mobile Menu */}
    <motion.div
        initial={false}
        animate={isOpen ? { x: 0 } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 w-full min-h-screen bg-[#ebe9e7] z-[40] flex flex-col items-center justify-center lg:hidden overflow-y-auto"
    >
        {/* Logo */}
        <Link to="/" onClick={handleNavClick}>
        <img src={logo} alt="logo" className="mb-10 w-24" />
        </Link>

        {/* Menu Items */}
        <ul className="space-y-8 font-bold text-[20px] text-center">
        {menuItems.map((item) => (
            <li key={item.path}>
            <Link
                to={item.path}
                onClick={handleNavClick}
                className={`${
                isActiveRoute(location.pathname, item.path)
                    ? "text-[#f39248]" 
                    : "text-[#1d3866] hover:text-[#f39248]"
                } transition-colors duration-300`}
            >
                {item.name}
            </Link>
            </li>
        ))}
        
          {/* Order Button - Mobile */}
        <li className="pt-4">
            <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleNavClick}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-full hover:from-[#1d3866] hover:to-green-600 transition-all duration-300 shadow-xl text-lg font-bold"
            >
            <FaWhatsapp className="text-2xl" />
            <span>Order Now</span>
            </a>
        </li>
        </ul>

        {/* Close Button */}
        <button 
        onClick={onClose}
        className="absolute top-10 right-10 text-gray-800 hover:text-gray-600 transition-colors"
        aria-label="Close menu"
        >
        <IoMdClose size={40} />
        </button>
    </motion.div>
    </>
);
};

export default NavbarMobile;