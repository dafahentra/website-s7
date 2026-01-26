// components/Navbar/NavbarDesktop.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { LuAlignRight } from "react-icons/lu";
import logo from "../../assets/logo.png";
import { menuItems, getWhatsAppLink, isActiveRoute } from "../../data/navbarData";

const NavbarDesktop = ({ onMenuToggle }) => {
const location = useLocation();
const whatsappLink = getWhatsAppLink();

  // Scroll animations
const { scrollY } = useScroll();
const width = useTransform(scrollY, [0, 400], ["100%", "76%"]);
const marginTop = useTransform(scrollY, [0, 400], ["0px", "24px"]);
const borderRadius = useTransform(scrollY, [0, 400], ["0px", "50px"]);
const backgroundColor = useTransform(scrollY, [0, 400], [
    "rgba(255, 255, 255, 0)",
    "rgba(255, 255, 255, 0.65)"
]);
const boxShadow = useTransform(scrollY, [0, 400], [
    "0 0 0 0 rgba(0, 0, 0, 0)", 
    "0 8px 32px 0 rgba(31, 38, 135, 0.1)" 
]);
const border = useTransform(scrollY, [0, 400], [
    "1px solid rgba(255, 255, 255, 0)",
    "1px solid rgba(255, 255, 255, 0.8)"
]);
const padding = useTransform(scrollY, [0, 400], ["1.5rem 2rem", "0.8rem 2rem"]);

return (
    <motion.nav
    style={{
        width,
        marginTop,
        borderRadius,
        backgroundColor,
        boxShadow,
        border,
        padding
    }}
    className="pointer-events-auto backdrop-blur-md flex items-center justify-between max-w-[1400px]"
    >
      {/* Logo Section */}
    <Link to="/" className="flex items-center">
        <motion.img 
        src={logo} 
        alt="logo" 
        style={{ 
            width: useTransform(scrollY, [0, 150], [100, 80]) 
        }}
        />
    </Link>

      {/* Menu Items (Desktop) */}
    <ul className="lg:flex hidden items-center gap-8 font-bold text-[16px] capitalize">
        {menuItems.map((item) => (
        <li key={item.path}>
            <Link
            to={item.path}
            className={`cursor-pointer transition-colors duration-300 whitespace-nowrap ${
                isActiveRoute(location.pathname, item.path)
                ? "text-[#f39248]" 
                : "text-[#1d3866] hover:text-[#f39248]"
            }`}
            >
            {item.name}
            </Link>
        </li>
        ))}
        
        {/* Order Button - WhatsApp Direct Link */}
        <li>
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-full hover:from-[#1d3866] hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
        >
            <FaWhatsapp className="text-xl" />
            <span>Order Now</span>
        </a>
        </li>
    </ul>

      {/* Mobile Menu Button */}
    <div
        className="lg:hidden flex cursor-pointer text-[#1d3866]"
        onClick={onMenuToggle}
    >
        <LuAlignRight size={30} />
    </div>
    </motion.nav>
);
};

export default NavbarDesktop;