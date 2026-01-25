import React, { useState } from "react";
import { motion } from "framer-motion";
import Contact from "../components/Contact";

const ContactUs = () => {
const [formData, setFormData] = useState({
name: "",
email: "",
phone: "",
subject: "",
message: ""
});

const handleChange = (e) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value
});
};

const handleSubmit = (e) => {
e.preventDefault();
// Handle form submission here
console.log("Form submitted:", formData);
alert("Terima kasih! Pesan Anda telah terkirim.");
// Reset form
setFormData({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
});
};

return (
<div className="pt-32 min-h-screen">
    <div className="max-w-[1200px] mx-auto mb-20">
    {/* Header */}
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 mx-4"
    >
        <h1 className="text-6xl font-bold text-[#1d3866] mb-6">Contact Us</h1>
        <p className="text-2xl text-[#f39248] max-w-3xl mx-auto">
        Ada pertanyaan? Kami siap membantu Anda!
        </p>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-12 mx-4">
        {/* Contact Form */}
        <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white p-8 rounded-3xl shadow-2xl"
        >
        <h2 className="text-3xl font-bold text-[#1d3866] mb-6">
            Kirim Pesan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
            <label className="block text-gray-700 font-semibold mb-2">
                Nama Lengkap *
            </label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1d3866] focus:outline-none transition-colors"
                placeholder="Masukkan nama Anda"
            />
            </div>

            {/* Email */}
            <div>
            <label className="block text-gray-700 font-semibold mb-2">
                Email *
            </label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1d3866] focus:outline-none transition-colors"
                placeholder="email@example.com"
            />
            </div>

            {/* Phone */}
            <div>
            <label className="block text-gray-700 font-semibold mb-2">
                No. Telepon
            </label>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1d3866] focus:outline-none transition-colors"
                placeholder="08xx-xxxx-xxxx"
            />
            </div>

            {/* Subject */}
            <div>
            <label className="block text-gray-700 font-semibold mb-2">
                Subjek *
            </label>
            <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1d3866] focus:outline-none transition-colors"
                placeholder="Topik pesan Anda"
            />
            </div>

            {/* Message */}
            <div>
            <label className="block text-gray-700 font-semibold mb-2">
                Pesan *
            </label>
            <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1d3866] focus:outline-none transition-colors resize-none"
                placeholder="Tulis pesan Anda di sini..."
            ></textarea>
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            className="w-full bg-[#1d3866] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#f39248] transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
            Kirim Pesan
            </button>
        </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
        >
        {/* Info Cards */}
        <div className="bg-gradient-to-br from-[#1d3866] to-[#2a4d7d] p-8 rounded-3xl text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Hubungi Kami</h3>
            <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                </div>
                <div>
                <p className="text-sm opacity-80">Telepon</p>
                <p className="font-bold text-lg">0812-1111-8456</p>
                </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                </div>
                <div>
                <p className="text-sm opacity-80">Email</p>
                <p className="font-bold text-lg">sectorsevenyk@gmail.com</p>
                </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                </div>
                <div>
                <p className="text-sm opacity-80">Alamat</p>
                <p className="font-bold">
                    Jl. Sosio Humaniora, Karang Malang, Caturtunggal, 
                    Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta
                </p>
                </div>
            </div>
            </div>
        </div>

        {/* Social Media */}
        <div className="bg-gradient-to-br from-[#f39248] to-[#ff6b35] p-8 rounded-3xl text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
            <div className="flex gap-4">
            <a
                href="https://instagram.com/sectorseven.yk"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            </a>
            <a
                href="#"
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            </a>
            <a
                href="#"
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
            </a>
            </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold text-[#1d3866] mb-6">
            Jam Operasional
            </h3>
            <div className="space-y-3 text-gray-700">
            <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold">Senin - Jumat</span>
                <span>08:00 - 22:00</span>
            </div>
            </div>
        </div>
        </motion.div>
    </div>
    </div>

    <Contact />
</div>
);
};

export default ContactUs;