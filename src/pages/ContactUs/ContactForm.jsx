// components/ContactUs/ContactForm.jsx - SIMPLE NUMBER ONLY WITH AUTO-FORMAT
import React, { memo } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../../styles/designSystem";

// Memoized FormInput component with design system
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
      <label className={`block text-gray-700 ${TYPOGRAPHY.weight.medium} mb-2 ${TYPOGRAPHY.body.small}`}>
        {label}
      </label>
      <InputComponent
        type={!isTextarea ? type : undefined}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={isTextarea ? rows : undefined}
        className={`w-full px-4 py-3 border border-gray-300 ${RADIUS.card.default} focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${TRANSITIONS.fast} ${
          isTextarea ? 'resize-none' : ''
        }`}
        placeholder={placeholder}
      />
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Simple Phone Input - Number Only (No Dash)
const PhoneInput = memo(({ label, name, value, onChange, required = false, placeholder }) => {
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    
    // Remove all non-numeric characters except + at start
    let cleaned = input.replace(/[^\d+]/g, '');
    
    // Only allow + at the beginning
    if (cleaned.indexOf('+') > 0) {
      cleaned = cleaned.replace(/\+/g, '');
    }
    
    // If there's a +, make sure it's only at the start
    if (cleaned.startsWith('+')) {
      const numbers = cleaned.slice(1).replace(/\+/g, '');
      cleaned = '+' + numbers;
    }
    
    // Create synthetic event with cleaned value
    const syntheticEvent = {
      target: {
        name: name,
        value: cleaned
      }
    };
    
    onChange(syntheticEvent);
  };

  return (
    <div>
      <label className={`block text-gray-700 ${TYPOGRAPHY.weight.medium} mb-2 ${TYPOGRAPHY.body.small}`}>
        {label}
      </label>
      <input
        type="tel"
        name={name}
        value={value}
        onChange={handlePhoneChange}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 ${RADIUS.card.default} focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${TRANSITIONS.fast}`}
        placeholder={placeholder}
        inputMode="numeric"
      />
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

const ContactForm = ({ formData, isSubmitting, onSubmit, onChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className={`bg-white ${RADIUS.image.responsive} ${SHADOWS.image.responsive} p-5 sm:p-8 lg:p-12`}
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

        {/* Phone - Simple Number Only (No Dash) */}
        <PhoneInput
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+62"
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

        {/* Submit Button with Design System */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-brand-navy text-white py-3 sm:py-4 ${RADIUS.card.default} ${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} sm:${TYPOGRAPHY.body.default} ${TRANSITIONS.hover.color} shadow-card-lg hover:shadow-card-xl ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-brand-orange'
          }`}
        >
          {isSubmitting ? 'SENDING...' : 'SEND'}
        </button>
      </form>
    </motion.div>
  );
};

export default memo(ContactForm);