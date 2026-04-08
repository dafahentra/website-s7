// components/Navbar/NavbarDesktop.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { BsCart3 } from "react-icons/bs";
import { LuAlignRight } from "react-icons/lu";
import logo from "../../assets/logo.png";
import { menuItems, isActiveRoute } from "../../data/navbarData";
import useAnalytics from "../../hooks/useAnalytics";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

const NavbarDesktop = ({ onMenuToggle, isMenuPage }) => {
  const location = useLocation();
  const { trackNav } = useAnalytics();

  // Scroll animations — selalu dipanggil agar tidak melanggar Rules of Hooks
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
  const paddingAnim = useTransform(
    scrollY,
    [0, 400],
    ["1.5rem 2rem", "0.8rem 2rem"]
  );
  const logoWidthAnim = useTransform(scrollY, [0, 150], [100, 80]);

  // Jika di halaman /menu, gunakan nilai fixed (nilai AWAL sebelum transform)
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

  const logoStyle = {
    width: isMenuPage ? 100 : logoWidthAnim,
  };

  // Handle Navigation Click with Analytics
  const handleNavClick = (itemName) => {
    trackNav(itemName);
  };

  return (
    <motion.nav
      style={navStyle}
      className="pointer-events-auto backdrop-blur-md flex items-center justify-between max-w-[1400px]"
    >
      {/* Logo Section */}
      <Link to="/" onClick={() => handleNavClick("Logo")}>
        <motion.img src={logo} alt="logo" style={logoStyle} />
      </Link>

      {/* Menu Items (Desktop) */}
      <ul
        className={`lg:flex hidden items-center gap-8 ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} capitalize`}
      >
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

        {/* Order Button - Link to /menu */}
        <li>
          <Link
            to="/menu"
            onClick={() => handleNavClick("Order Now")}
            className={`flex items-center gap-2 bg-gradient-to-r from-brand-orange to-orange-400 text-white px-6 py-3 ${RADIUS.circle} hover:from-orange-600 hover:to-brand-orange ${TRANSITIONS.fast} shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap`}
          >
            <BsCart3 className="text-xl" />
            <span>Order Now</span>
          </Link>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <div
        className="lg:hidden flex cursor-pointer text-brand-navy"
        onClick={onMenuToggle}
      >
        <LuAlignRight size={30} />
      </div>
    </motion.nav>
  );
};

export default React.memo(NavbarDesktop);