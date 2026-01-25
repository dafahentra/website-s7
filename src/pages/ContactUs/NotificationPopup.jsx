// components/ContactUs/NotificationPopup.jsx
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const NotificationPopup = ({ show, type, onClose }) => {
const isSuccess = type === 'success';

return (
<AnimatePresence>
    {show && (
    <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -50, x: '-50%' }}
        className="fixed top-8 left-1/2 z-50 max-w-md w-full mx-4"
    >
        <div className={`rounded-2xl shadow-2xl p-6 flex items-center gap-4 ${
        isSuccess 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
        {isSuccess ? (
            <CheckCircle className="w-8 h-8 flex-shrink-0" />
        ) : (
            <XCircle className="w-8 h-8 flex-shrink-0" />
        )}
        <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
            {isSuccess ? 'Pesan Terkirim!' : 'Gagal Mengirim'}
            </h3>
            <p className="text-sm opacity-90">
            {isSuccess 
                ? 'Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.'
                : 'Terjadi kesalahan. Silakan coba lagi atau hubungi kami melalui email/telepon.'
            }
            </p>
        </div>
        <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close notification"
        >
            <XCircle className="w-5 h-5" />
        </button>
        </div>
    </motion.div>
    )}
</AnimatePresence>
);
};

export default memo(NotificationPopup);