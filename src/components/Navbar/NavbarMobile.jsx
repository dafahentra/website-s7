// components/Navbar/NavbarMobile.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";
import logo from "../../assets/logo.png";
import { menuItems, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

import {
  LuHome,
  LuInfo,
  LuLayoutGrid,
  LuStore,
  LuPhone,
  LuUtensilsCrossed,
} from "react-icons/lu";

const iconMap = {
  Home: <LuHome size={20} />,
  About: <LuInfo size={20} />,
  Menu: <LuLayoutGrid size={20} />,
  Store: <LuStore size={20} />,
  Contact: <LuPhone size={20} />,
};

const itemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.045,
      duration: 0.28,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: (i) => ({
    opacity: 0,
    y: -4,
    transition: {
      delay: i * 0.02,
      duration: 0.18,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

const NavbarMobile = ({ isOpen, onClose, isTransformed, isMenuPage, anchorRect }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();

  const handleNavClick = (itemName) => {
    trackNav(itemName);
    onClose();
  };

  // ─────────────────────────────────────────────
  // MODE A: Belum transform ATAU sedang di /menu
  // → full-screen slide asli
  // ─────────────────────────────────────────────
  const useFullScreen = !isTransformed || isMenuPage;

  if (useFullScreen) {
    return (
      <>
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
        <motion.div
          initial={false}
          animate={isOpen ? { x: 0 } : { x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 w-full min-h-screen bg-brand-nav-mobile z-[40] flex flex-col items-center justify-center lg:hidden overflow-y-auto"
        >
          <Link to="/" onClick={() => handleNavClick("Logo")}>
            <img src={logo} alt="logo" className="mb-10 w-24" />
          </Link>
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
            <li className="pt-4">
              <Link
                to="/menu"
                onClick={() => handleNavClick("Order Now")}
                className={`inline-flex items-center gap-3 bg-gradient-to-r from-brand-orange to-orange-400 text-white px-8 py-4 ${RADIUS.circle} hover:from-orange-600 hover:to-brand-orange ${TRANSITIONS.fast} shadow-xl ${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold}`}
              >
                <BsCart3 className="text-2xl" />
                <span>Order Now</span>
              </Link>
            </li>
          </ul>
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
  }

  // ─────────────────────────────────────────────
  // MODE B: Sudah transform & bukan /menu
  // → Liquid glass dropdown dari bawah navbar pill
  // ─────────────────────────────────────────────
  const dropdownStyle = anchorRect
    ? {
        position: "fixed",
        top: anchorRect.top + 6,
        left: anchorRect.left,
        width: anchorRect.width,
        zIndex: 39,
        borderRadius: "28px",
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        boxShadow:
          "0 8px 32px rgba(31, 38, 135, 0.10), 0 1.5px 0 0 rgba(255,255,255,0.6) inset, 0 -1px 0 0 rgba(255,255,255,0.2) inset",
        overflow: "hidden",
      }
    : { display: "none" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[38] lg:hidden"
            onClick={onClose}
          />

          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scaleY: 0.85, y: -8 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.88, y: -6 }}
            transition={{
              duration: 0.38,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              ...dropdownStyle,
              transformOrigin: "top center",
            }}
            className="lg:hidden"
          >
            <ul className="py-2">
              {menuItems.map((item, i) => {
                const active = isActiveRoute(location.pathname, item.path);
                const icon = iconMap[item.name] ?? <LuUtensilsCrossed size={20} />;

                return (
                  <motion.li
                    key={item.path}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      to={item.path}
                      onClick={() => handleNavClick(item.name)}
                      className={`
                        flex items-center gap-4 px-6 py-[15px]
                        ${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold}
                        transition-colors duration-150
                        ${active ? "text-brand-orange" : "text-brand-navy/80 hover:text-brand-navy"}
                      `}
                      style={{
                        background: active
                          ? "rgba(234,88,12,0.07)"
                          : "transparent",
                      }}
                    >
                      <span className={`transition-colors duration-150 ${active ? "text-brand-orange" : "text-brand-navy/30"}`}>
                        {icon}
                      </span>
                      {item.name}
                    </Link>
                    {i < menuItems.length - 1 && (
                      <div className="mx-6" style={{ height: "0.5px", background: "rgba(0,0,0,0.08)" }} />
                    )}
                  </motion.li>
                );
              })}
            </ul>

            <div className="mx-5" style={{ height: "0.5px", background: "rgba(0,0,0,0.1)" }} />

            <motion.div
              className="px-5 py-4"
              custom={menuItems.length}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Link
                to="/menu"
                onClick={() => handleNavClick("Order Now")}
                className="flex items-center justify-center gap-2.5 bg-brand-orange text-white px-6 py-3 rounded-2xl w-full font-bold transition-all duration-200 hover:brightness-105 active:scale-[0.98] shadow-md text-[15px]"
              >
                <BsCart3 size={17} />
                <span>Order Now</span>
              </Link>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(NavbarMobile);