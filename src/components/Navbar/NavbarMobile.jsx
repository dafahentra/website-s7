// components/Navbar/NavbarMobile.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useMotionTemplate,
  useScroll,
} from "framer-motion";
import { BsCart3 } from "react-icons/bs";
import { menuItems, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY } from "../../styles/designSystem";
import {
  LuHome, LuInfo, LuLayoutGrid, LuStore, LuPhone, LuUtensilsCrossed,
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
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: (i) => ({
    opacity: 0, y: -3,
    transition: { delay: i * 0.015, duration: 0.16, ease: [0.4, 0, 1, 1] },
  }),
};

const NavbarMobile = ({ isOpen, onClose, isTransformed, navRef, isMenuPage }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();
  const { scrollY } = useScroll();

  const mvLeft  = useMotionValue(0);
  const mvWidth = useMotionValue(typeof window !== "undefined" ? window.innerWidth : 390);
  const mvTop   = useMotionValue(80);

  useAnimationFrame(() => {
    if (!navRef?.current) return;
    const rect = navRef.current.getBoundingClientRect();
    mvLeft.set(rect.left);
    mvWidth.set(rect.width);
    mvTop.set(rect.bottom + 2);
  });

  // FIX: Semua hooks HARUS dipanggil tanpa kondisi (Rules of Hooks).
  // Sebelumnya, useMotionValue / useTransform dipanggil di dalam ternary
  // operator → urutan hooks berubah antar render → React crash → blank screen.
  //
  // Solusi: selalu panggil kedua hook, lalu pilih nilainya SETELAH semua
  // hook sudah dipanggil.

  const bgColorStatic   = useMotionValue("rgba(255,255,255,0)");
  const bgColorScrolled = useTransform(
    scrollY, [0, 400],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.65)"]
  );

  const borderStatic   = useMotionValue("1px solid rgba(255,255,255,0)");
  const borderScrolled = useTransform(
    scrollY, [0, 400],
    ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.8)"]
  );

  const shadowStatic   = useMotionValue("0 0 0 0 rgba(0,0,0,0)");
  const shadowScrolled = useTransform(
    scrollY, [0, 400],
    ["0 0 0 0 rgba(31,38,135,0)", "0 8px 32px 0 rgba(31,38,135,0.1)"]
  );

  const radiusTopStatic    = useMotionValue(0);
  const radiusTopScrolled  = useTransform(scrollY, [0, 400], [0, 50]);
  const radiusBotStatic    = useMotionValue(0);
  const radiusBotScrolled  = useTransform(scrollY, [0, 400], [0, 36]);
  const radiusBtnStatic    = useMotionValue(20);
  const radiusBtnScrolled  = useTransform(scrollY, [0, 400], [20, 28]);

  // Pilih nilai yang tepat SETELAH semua hook dipanggil
  const bgColor    = isMenuPage ? bgColorStatic   : bgColorScrolled;
  const borderVal  = isMenuPage ? borderStatic    : borderScrolled;
  const shadowVal  = isMenuPage ? shadowStatic    : shadowScrolled;
  const radiusTop  = isMenuPage ? radiusTopStatic : radiusTopScrolled;
  const radiusBottom = isMenuPage ? radiusBotStatic : radiusBotScrolled;
  const radiusBtn  = isMenuPage ? radiusBtnStatic : radiusBtnScrolled;

  const btnBorderRadius = useMotionTemplate`${radiusBtn}px`;

  const handleNavClick = (itemName) => {
    trackNav(itemName);
  };

  const handleBackdropClick = () => onClose();

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[38] lg:hidden"
            onClick={handleBackdropClick}
          />

          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scaleY: 0.82, y: -10 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.86, y: -8 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "fixed",
              zIndex: 39,
              transformOrigin: "top center",
              top: mvTop,
              left: mvLeft,
              width: mvWidth,
              borderTopLeftRadius: radiusTop,
              borderTopRightRadius: radiusTop,
              borderBottomLeftRadius: radiusBottom,
              borderBottomRightRadius: radiusBottom,
              background: bgColor,
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: borderVal,
              boxShadow: shadowVal,
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
                      className={`flex items-center gap-4 px-6 py-[15px] ${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold} transition-colors duration-150 ${active ? "text-brand-orange" : "text-brand-navy/80 hover:text-brand-navy"}`}
                      style={{ background: active ? "rgba(234,88,12,0.07)" : "transparent" }}
                    >
                      <span className={`transition-colors duration-150 ${active ? "text-brand-orange" : "text-brand-navy/25"}`}>
                        {icon}
                      </span>
                      {item.name}
                    </Link>
                    {i < menuItems.length - 1 && (
                      <div className="mx-6" style={{ height: "0.5px", background: "rgba(0,0,0,0.07)" }} />
                    )}
                  </motion.li>
                );
              })}
            </ul>

            <div className="mx-5" style={{ height: "0.5px", background: "rgba(0,0,0,0.09)" }} />

            <motion.div
              className="px-5 py-4"
              custom={menuItems.length}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                style={{ borderRadius: btnBorderRadius, overflow: "hidden" }}
                className="w-full shadow-md"
              >
                <Link
                  to="/menu"
                  onClick={() => handleNavClick("Order Now")}
                  className="flex items-center justify-center gap-2.5 bg-brand-orange text-white px-6 py-3 w-full font-bold transition-all duration-200 hover:brightness-105 active:scale-[0.98] text-[15px]"
                >
                  <BsCart3 size={17} />
                  <span>Order Now</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(NavbarMobile);