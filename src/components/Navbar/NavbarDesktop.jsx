// components/Navbar/NavbarDesktop.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { BsCart3 } from "react-icons/bs";
import logo from "../../assets/logo.png";
import { menuItems, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

// Komponen hamburger → X yang smooth ala Apple
const MenuIcon = ({ isOpen }) => (
  <div className="w-[26px] h-[18px] relative flex flex-col justify-between cursor-pointer">
    {/* Line atas */}
    <motion.span
      className="block h-[2px] bg-brand-navy rounded-full origin-center"
      animate={
        isOpen
          ? { rotate: 45, y: 8, width: "100%" }
          : { rotate: 0, y: 0, width: "100%" }
      }
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    />
    {/* Line tengah */}
    <motion.span
      className="block h-[2px] bg-brand-navy rounded-full"
      animate={
        isOpen
          ? { opacity: 0, scaleX: 0 }
          : { opacity: 1, scaleX: 1 }
      }
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    />
    {/* Line bawah */}
    <motion.span
      className="block h-[2px] bg-brand-navy rounded-full origin-center"
      animate={
        isOpen
          ? { rotate: -45, y: -8, width: "100%" }
          : { rotate: 0, y: 0, width: "100%" }
      }
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    />
  </div>
);

const NavbarDesktop = ({ navRef, onMenuToggle, isMenuPage, isTransformed, mobileMenuOpen }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();
  const { scrollY } = useScroll();

  const widthAnim = useTransform(scrollY, [0, 400], ["100%", "76%"]);
  const marginTopAnim = useTransform(scrollY, [0, 400], ["0px", "24px"]);
  const borderRadiusAnim = useTransform(scrollY, [0, 400], ["0px", "50px"]);
  const bgAnim = useTransform(scrollY, [0, 400], [
    "rgba(255, 255, 255, 0)",
    "rgba(255, 255, 255, 0.65)",
  ]);
  const boxShadowAnim = useTransform(scrollY, [0, 400], [
    "0 0 0 0 rgba(0, 0, 0, 0)",
    "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
  ]);
  const borderAnim = useTransform(scrollY, [0, 400], [
    "1px solid rgba(255, 255, 255, 0)",
    "1px solid rgba(255, 255, 255, 0.8)",
  ]);
  const paddingAnim = useTransform(scrollY, [0, 400], ["1.5rem 2rem", "0.8rem 2rem"]);
  const logoWidthAnim = useTransform(scrollY, [0, 150], [100, 80]);

  const navStyle = isMenuPage
    ? {
        width: "100%",
        marginTop: "0px",
        borderRadius: "0px",
        backgroundColor: "rgba(255, 255, 255, 0)",
        boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
        border: "1px solid rgba(255, 255, 255, 0)",
        padding: "1.5rem 2rem",
      }
    : {
        width: widthAnim,
        marginTop: marginTopAnim,
        borderRadius: borderRadiusAnim,
        backgroundColor: bgAnim,
        boxShadow: boxShadowAnim,
        border: borderAnim,
        padding: paddingAnim,
      };

  const handleNavClick = (itemName) => trackNav(itemName);

  return (
    <motion.nav
      ref={navRef}
      style={navStyle}
      className="pointer-events-auto backdrop-blur-md flex items-center justify-between max-w-[1400px]"
    >
      <Link to="/" onClick={() => handleNavClick("Logo")}>
        <motion.img src={logo} alt="logo" style={{ width: isMenuPage ? 100 : logoWidthAnim }} />
      </Link>

      {/* Desktop menu */}
      <ul className={`lg:flex hidden items-center gap-8 ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} capitalize`}>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={() => handleNavClick(item.name)}
              className={`cursor-pointer ${TRANSITIONS.hover.color} whitespace-nowrap ${
                isActiveRoute(location.pathname, item.path)
                  ? "text-brand-orange"
                  : "text-brand-navy hover:text-brand-orange"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/menu"
            onClick={() => handleNavClick("Order Now")}
            className={`flex items-center gap-2 bg-brand-orange text-white px-6 py-3 ${RADIUS.circle} transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap`}
          >
            <BsCart3 className="text-xl" />
            <span>Order Now</span>
          </Link>
        </li>
      </ul>

      {/* Hamburger → X */}
      <div className="lg:hidden flex items-center" onClick={onMenuToggle}>
        <MenuIcon isOpen={mobileMenuOpen} />
      </div>
    </motion.nav>
  );
};

export default React.memo(NavbarDesktop);