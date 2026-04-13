// components/Navbar/NavbarMobile.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsCart3 } from "react-icons/bs";
import { menuItems, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY, TRANSITIONS } from "../../styles/designSystem";

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
  hidden: { opacity: 0, y: -5 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.26,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  exit: (i) => ({
    opacity: 0,
    y: -3,
    transition: {
      delay: i * 0.015,
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

const NavbarMobile = ({ isOpen, onClose, isTransformed, anchorRect }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();

  const handleNavClick = (itemName) => {
    trackNav(itemName);
    onClose();
  };

  // Kalau anchorRect belum tersedia, fallback ke full width di top 0
  const top = anchorRect ? anchorRect.top + 6 : 80;
  const left = anchorRect ? anchorRect.left : 0;
  const width = anchorRect ? anchorRect.width : "100%";

  // Border radius: saat belum transform navbar masih kotak (0px),
  // saat sudah transform navbar jadi pill (50px) → dropdown ikut membulat (28px)
  const dropdownRadius = isTransformed ? "28px" : "0px 0px 24px 24px";

  // Background: liquid glass konsisten di dua state,
  // bedanya shadow lebih besar saat sudah jadi pill (lebih "melayang")
  const dropdownShadow = isTransformed
    ? "0 12px 40px rgba(31, 38, 135, 0.13), 0 1.5px 0 0 rgba(255,255,255,0.65) inset"
    : "0 8px 24px rgba(31, 38, 135, 0.08), 0 1px 0 0 rgba(255,255,255,0.5) inset";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[38] lg:hidden"
            onClick={onClose}
          />

          {/* Dropdown — posisi, lebar, dan radius ikut navbar secara smooth */}
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scaleY: 0.82, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.86, y: -8 }}
            transition={{
              duration: 0.36,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              position: "fixed",
              zIndex: 39,
              transformOrigin: "top center",
              // Posisi & lebar mengikuti navbar — di-animate agar smooth saat navbar berubah ukuran
              top,
              left,
              width,
              borderRadius: dropdownRadius,
              // Liquid glass
              background: "rgba(255, 255, 255, 0.58)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.78)",
              boxShadow: dropdownShadow,
              overflow: "hidden",
              // Transisi lebar/posisi/radius saat navbar transform
              transition: "top 0.4s cubic-bezier(0.32,0.72,0,1), left 0.4s cubic-bezier(0.32,0.72,0,1), width 0.4s cubic-bezier(0.32,0.72,0,1), border-radius 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s ease",
            }}
            className="lg:hidden"
          >
            {/* Menu Items */}
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
                        background: active ? "rgba(234,88,12,0.07)" : "transparent",
                      }}
                    >
                      <span
                        className={`transition-colors duration-150 ${
                          active ? "text-brand-orange" : "text-brand-navy/25"
                        }`}
                      >
                        {icon}
                      </span>
                      {item.name}
                    </Link>

                    {i < menuItems.length - 1 && (
                      <div
                        className="mx-6"
                        style={{ height: "0.5px", background: "rgba(0,0,0,0.07)" }}
                      />
                    )}
                  </motion.li>
                );
              })}
            </ul>

            {/* Divider */}
            <div
              className="mx-5"
              style={{ height: "0.5px", background: "rgba(0,0,0,0.09)" }}
            />

            {/* Order Now */}
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