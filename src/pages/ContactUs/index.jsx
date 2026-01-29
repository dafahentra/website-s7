// pages/ContactUs/index.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { lazy, Suspense } from "react";
import SEO from "../../components/SEO";
import { useContactForm } from "../../hooks/useContactForm";
import NotificationPopup from "./NotificationPopup";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
import { SPACING } from "../../styles/designSystem";

// Lazy load Contact component
const Contact = lazy(() => import("../../components/Contact"));

// Loading placeholder component
const ContactPlaceholder = () => (
  <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg"></div>
);

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
        title="Contact - SECTOR SEVEN"
        description="Get in touch with SECTOR SEVEN. Visit us at Digital Lounge CIMB Niaga UGM, call us, or send us a message. We'd love to hear from you! Open daily 07:30-17:00."
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

        <div className={`${SPACING.container.centered} mb-element-sm md:mb-element-md lg:mb-element`}>
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch justify-items-center">
            {/* Left Side - Contact Information */}
            <div className="w-full max-w-xl lg:max-w-none">
              <ContactInfo />
            </div>

            {/* Right Side - Contact Form */}
            <div className="w-full max-w-xl lg:max-w-none">
              <ContactForm 
                formData={formData}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Lazy load Contact component with Suspense */}
        <Suspense fallback={<ContactPlaceholder />}>
          <Contact />
        </Suspense>
      </div>
    </>
  );
};

export default ContactUs;
