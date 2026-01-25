// components/ContactUs/ContactForm.jsx
import React from "react";
import { motion } from "framer-motion";

const ContactForm = ({ formData, isSubmitting, onSubmit, onChange }) => {
return (
<motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="bg-white rounded-3xl shadow-xl p-8 lg:p-12"
>
    <form onSubmit={onSubmit} className="space-y-6">
    {/* Name */}
    <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
        Name
        </label>
        <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
        placeholder="John Doe"
        />
    </div>

    {/* Email */}
    <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
        Email
        </label>
        <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
        placeholder="johndoe@example.com"
        />
    </div>

    {/* Phone */}
    <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
        Phone Number
        </label>
        <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
        placeholder="+62 812-3456-7890"
        />
    </div>

    {/* Message */}
    <div>
        <label className="block text-gray-700 font-medium mb-2 text-sm">
        Message
        </label>
        <textarea
        name="message"
        value={formData.message}
        onChange={onChange}
        required
        rows="4"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all resize-none"
        placeholder="Write your message here..."
        ></textarea>
    </div>

    {/* Submit Button */}
    <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl ${
        isSubmitting 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-green-800'
        }`}
    >
        {isSubmitting ? 'SENDING...' : 'SEND'}
    </button>
    </form>
</motion.div>
);
};

export default ContactForm;