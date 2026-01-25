// components/Navbar/NavbarMobile.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { menuItems, getWhatsAppLink } from "../../data/navbarData";

const NavbarMobile = ({ isOpen, onClose }) => {
const location = useLocation();
const whatsappLink = getWhatsAppLink();

// Function untuk cek apakah link aktif atau berada di child route
const isActive = (path) => {
// Untuk News, juga aktif jika di /news/:slug
if (path === "/news") {
    return location.pathname.startsWith("/news");
}
return location.pathname === path;
};

// Close mobile menu saat navigasi
const handleNavClick = () => {
onClose();
};

return (
<motion.div
    initial={false}
    animate={isOpen ? { x: 0 } : { x: "100%" }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed top-0 right-0 w-full min-h-screen bg-[#ebe9e7] z-[40] flex flex-col items-center justify-center lg:hidden pointer-events-auto"
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
            isActive(item.path) 
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
        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-xl text-lg font-bold"
        >
        <FaWhatsapp className="text-2xl" />
        <span>Order Now</span>
        </a>
    </li>
    </ul>

    {/* Close Button */}
    <button 
    onClick={onClose}
    className="absolute top-10 right-10 text-gray-800"
    >
    <IoMdClose size={40} />
    </button>
</motion.div>
);
};

export default NavbarMobile;