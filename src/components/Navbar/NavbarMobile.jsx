// components/Navbar/NavbarMobile.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { menuItems, getWhatsAppLink, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

const NavbarMobile = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { trackWhatsAppOrder, trackNav } = useAnalytics();

  // Memoize WhatsApp link
  const whatsappLink = useMemo(() => getWhatsAppLink(), []);

  // Handle WhatsApp Click with Analytics
  const handleWhatsAppClick = () => {
    trackWhatsAppOrder('mobile');
    onClose();
  };

  // Handle Navigation Click with Analytics
  const handleNavClick = (itemName) => {
    trackNav(itemName);
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
        className="fixed top-0 right-0 w-full min-h-screen bg-brand-nav-mobile z-[40] flex flex-col items-center justify-center lg:hidden overflow-y-auto"
      >
        {/* Logo */}
        <Link to="/" onClick={() => handleNavClick('Logo')}>
          <img src={logo} alt="logo" className="mb-10 w-24" />
        </Link>

        {/* Menu Items */}
        <ul className={`space-y-8 ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.subheading.lg} text-center`}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => handleNavClick(item.name)}
                className={`${
                  isActiveRoute(location.pathname, item.path)
                    ? "text-brand-orange" 
                    : "text-brand-navy hover:text-brand-orange"
                } ${TRANSITIONS.hover.color}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          
          {/* Order Button - Mobile with Analytics */}
          <li className="pt-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={`inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 ${RADIUS.circle} hover:from-brand-navy hover:to-green-600 ${TRANSITIONS.fast} shadow-xl ${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold}`}
            >
              <FaWhatsapp className="text-2xl" />
              <span>Order Now</span>
            </a>
          </li>
        </ul>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-10 right-10 text-gray-800 hover:text-gray-600 ${TRANSITIONS.hover.color}`}
          aria-label="Close menu"
        >
          <IoMdClose size={40} />
        </button>
      </motion.div>
    </>
  );
};

export default React.memo(NavbarMobile);
