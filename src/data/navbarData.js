// src/data/navbarData.js

export const menuItems = [
{ name: "About", path: "/about" },
{ name: "Menu", path: "/menu" },
{ name: "Store", path: "/store" },
{ name: "News", path: "/news" },
{ name: "Contact", path: "/contact-us" },
];

// WhatsApp Configuration
export const whatsappConfig = {
  phoneNumber: "6285111042497", // Format: country code + number (tanpa + dan -)
message: 
    "Halo Sector Seven! Saya ingin order \n\n" +
    "Nama: \n" +
    "Pesanan: \n" +
    "Waktu pengambilan: \n" +
    "Lokasi: "
};

// Generate WhatsApp Link
export const getWhatsAppLink = () => {
const { phoneNumber, message } = whatsappConfig;
const encodedMessage = encodeURIComponent(message);
return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};