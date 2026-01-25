import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { LuAlignRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Scroll animations
  const { scrollY } = useScroll();
  const width = useTransform(scrollY, [0, 400], ["100%", "75%"]);
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

  // WhatsApp Order Link
  const phoneNumber = "628125672013"; // Format: country code + number (tanpa + dan -)
  const message = encodeURIComponent(
    "Halo Sector Seven! Saya ingin order \n\n" +
    "Nama: \n" +
    "Pesanan: \n" +
    "Waktu pengambilan: \n" +
    "Lokasi: "
  );
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

  // Menu items dengan path - UPDATED: Tambah News
  const menuItems = [
    { name: "About", path: "/about" },
    { name: "Menu", path: "/menu" },
    { name: "Store", path: "/store" },
    { name: "News", path: "/news" },
    { name: "Contact", path: "/contact-us" },
  ];

  // Function untuk cek apakah link aktif atau berada di child route
  const isActive = (path) => {
    // Untuk News, juga aktif jika di /news/:slug
    if (path === "/news") {
      return location.pathname.startsWith("/news");
    }
    return location.pathname === path;
  };

  // Close mobile menu saat navigasi
  const handleMobileNavClick = () => {
    setOpen(false);
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 flex justify-center pointer-events-none">
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
                  isActive(item.path) 
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
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IoMdClose size={30} /> : <LuAlignRight size={30} />}
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={open ? { x: 0 } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 w-full min-h-screen bg-[#ebe9e7] z-[40] flex flex-col items-center justify-center lg:hidden pointer-events-auto"
      >
        <Link to="/" onClick={handleMobileNavClick}>
          <img src={logo} alt="logo" className="mb-10 w-24" />
        </Link>
        <ul className="space-y-8 font-bold text-[20px] text-center">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleMobileNavClick}
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
              onClick={handleMobileNavClick}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-full hover:from-[#1d3866] hover:to-green-600 transition-all duration-300 shadow-xl text-lg font-bold"
            >
              <FaWhatsapp className="text-2xl" />
              <span>Order Now</span>
            </a>
          </li>
        </ul>
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-10 right-10 text-gray-800"
        >
          <IoMdClose size={40} />
        </button>
      </motion.div>
    </div>
  );
};

export default Navbar;