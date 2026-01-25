// pages/ContactUs/index.jsx
import React from "react";
import { useContactForm } from "../../hooks/useContactForm";
import NotificationPopup from "./NotificationPopup";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
import Contact from "../../components/Contact";

const ContactUs = () => {
const {
formData,
isSubmitting,
showNotification,
notificationType,
handleChange,
handleSubmit,
hideNotification
} = useContactForm();

return (
<div className="pt-32 min-h-screen bg-gray-50">
    {/* Notification Popup */}
    <NotificationPopup 
    show={showNotification}
    type={notificationType}
    onClose={hideNotification}
    />

    <div className="max-w-7xl mx-auto px-4 mb-20">
    {/* Main Content Grid */}
    <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Side - Contact Information */}
        <ContactInfo />

        {/* Right Side - Contact Form */}
        <ContactForm 
        formData={formData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onChange={handleChange}
        />
    </div>
    </div>

    <Contact />
</div>
);
};

export default ContactUs;