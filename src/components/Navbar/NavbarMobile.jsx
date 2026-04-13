// components/Navbar/NavbarMobile.jsx
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue,
  useScroll,
} from "framer-motion";
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

// Spring config — identik dengan feel navbar
const SPRING = { stiffness: 300, damping: 35, mass: 0.5 };

const NavbarMobile = ({ isOpen, onClose, isTransformed, anchorRect }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();
  const { scrollY } = useScroll();

  // ── MotionValues untuk posisi & ukuran — di-drive dari anchorRect ──
  // anchorRect sudah di-update setiap scroll di parent (via scrollY listener)
  // Kita tinggal spring-ify agar gerakannya smooth

  const mvLeft = useMotionValue(anchorRect?.left ?? 0);
  const mvWidth = useMotionValue(anchorRect?.width ?? window.innerWidth);
  const mvTop = useMotionValue(anchorRect ? anchorRect.top + 6 : 80);

  const springLeft = useSpring(mvLeft, SPRING);
  const springWidth = useSpring(mvWidth, SPRING);
  const springTop = useSpring(mvTop, SPRING);

  // Update MotionValues setiap kali anchorRect berubah (driven by scroll di parent)
  useEffect(() => {
    if (!anchorRect) return;
    mvLeft.set(anchorRect.left);
    mvWidth.set(anchorRect.width);
    mvTop.set(anchorRect.top + 6);
  }, [anchorRect, mvLeft, mvWidth, mvTop]);

  // Border radius: derive dari scrollY langsung — ini pure visual, tidak butuh anchorRect
  const rawRadiusTop = useTransform(scrollY, [0, 400], [0, 28]);
  const rawRadiusBottom = useTransform(scrollY, [0, 400], [24, 28]);
  const radiusTop = useSpring(rawRadiusTop, SPRING);
  const radiusBottom = useSpring(rawRadiusBottom, SPRING);

  const handleNavClick = (itemName) => {
    trackNav(itemName);
    onClose();
  };

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

          {/*
            Semua nilai posisi & ukuran pakai MotionValue yang di-spring dari anchorRect.
            anchorRect di-update setiap frame scroll di parent (index.jsx),
            jadi dropdown selalu mengikuti navbar secara real-time & smooth.
          */}
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
              top: springTop,                        // ← MotionValue dari anchorRect
              left: springLeft,                      // ← MotionValue dari anchorRect
              width: springWidth,                    // ← MotionValue dari anchorRect
              borderTopLeftRadius: radiusTop,        // ← MotionValue dari scrollY
              borderTopRightRadius: radiusTop,
              borderBottomLeftRadius: radiusBottom,
              borderBottomRightRadius: radiusBottom,
              background: "rgba(255, 255, 255, 0.58)",
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.78)",
              boxShadow: isTransformed
                ? "0 12px 40px rgba(31, 38, 135, 0.13), 0 1.5px 0 0 rgba(255,255,255,0.65) inset"
                : "0 8px 24px rgba(31, 38, 135, 0.08), 0 1px 0 0 rgba(255,255,255,0.5) inset",
              overflow: "hidden",
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

            <div
              className="mx-5"
              style={{ height: "0.5px", background: "rgba(0,0,0,0.09)" }}
            />

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