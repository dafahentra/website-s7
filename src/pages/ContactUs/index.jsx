// pages/ContactUs/index.jsx
import React from "react";
import SEO from "../../components/SEO";
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
<>
    <SEO 
    title="Contact Us - Sector Seven Coffee | Get in Touch"
    description="Get in touch with Sector Seven Coffee. Visit us at Digital Lounge CIMB Niaga UGM, call us, or send us a message. We'd love to hear from you! Open daily 07:30-17:00."
    keywords="sector seven contact, contact coffee shop yogyakarta, sector seven ugm contact, coffee shop contact information, reach us"
    url="/contact-us"
    image="/og-image.jpg"
    />

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
</>
);
};

export default ContactUs;