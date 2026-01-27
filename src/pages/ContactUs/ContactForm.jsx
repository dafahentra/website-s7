// components/ContactUs/ContactForm.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";

// Memoized FormInput component untuk menghindari re-render
const FormInput = memo(({ 
label, 
type = "text", 
name, 
value, 
onChange, 
required = false, 
placeholder,
rows 
}) => {
const isTextarea = type === "textarea";
const InputComponent = isTextarea ? "textarea" : "input";

return (
<div>
    <label className="block text-gray-700 font-medium mb-2 text-sm">
    {label}
    </label>
    <InputComponent
    type={!isTextarea ? type : undefined}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    rows={isTextarea ? rows : undefined}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all ${
        isTextarea ? 'resize-none' : ''
    }`}
    placeholder={placeholder}
    />
</div>
);
});

FormInput.displayName = 'FormInput';

const ContactForm = ({ formData, isSubmitting, onSubmit, onChange }) => {
return (
<motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 lg:p-12"
>
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
    {/* Name */}
    <FormInput
        label="Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        placeholder="John Doe"
    />

    {/* Email */}
    <FormInput
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        required
        placeholder="johndoe@example.com"
    />

    {/* Phone */}
    <FormInput
        label="Phone Number"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        placeholder="+62 8xxxxxxxx"
    />

    {/* Message */}
    <FormInput
        label="Message"
        type="textarea"
        name="message"
        value={formData.message}
        onChange={onChange}
        required
        rows={4}
        placeholder="Write Your Message Here..."
    />

    {/* Submit Button */}
    <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-[#1d3866] text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors duration-300 shadow-lg hover:shadow-xl ${
        isSubmitting 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-[#f07828]'
        }`}
    >
        {isSubmitting ? 'SENDING...' : 'SEND'}
    </button>
    </form>
</motion.div>
);
};

export default memo(ContactForm);