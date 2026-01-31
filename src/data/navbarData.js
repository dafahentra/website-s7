// ========================================
// 3. data/navbarData.js - UPDATED
// ========================================
// src/data/navbarData.js

export const menuItems = [
{ name: "About", path: "/about" },
{ name: "Menu", path: "/menu" },
{ name: "Store", path: "/store" },
// { name: "News", path: "/news" }, //
{ name: "Contact", path: "/contact-us" },
];

// WhatsApp Configuration
export const whatsappConfig = {
  phoneNumber: "6285111042497", // Format: country code + number (tanpa + dan -)
message: 
    "Halo Sector Seven! Saya ingin order \n\n" +
    "Nama: \n" +
    "Pesanan: \n" +
    "Waktu pengambilan: \n"
};

// Generate WhatsApp Link
export const getWhatsAppLink = () => {
const { phoneNumber, message } = whatsappConfig;
const encodedMessage = encodeURIComponent(message);
return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Check if route is active (termasuk child routes)
export const isActiveRoute = (currentPath, targetPath) => {
  // Untuk News, juga aktif jika di /news/:slug
if (targetPath === "/news") {
    return currentPath.startsWith("/news");
}
return currentPath === targetPath;
};