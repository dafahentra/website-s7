// components/ContactUs/ContactInfo.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { memo } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { contactInfo, socialMediaLinks } from "../../data/contactData";
import { useAnalytics } from "../../hooks/useAnalytics";
import { TYPOGRAPHY, RADIUS, TRANSITIONS } from "../../styles/designSystem";

// Memoized SocialMediaLink component with tracking
const SocialMediaLink = memo(({ social, onSocialClick }) => {
  const handleClick = (e) => {
    onSocialClick(social.name.toLowerCase(), social.url);
  };

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`bg-white/20 backdrop-blur-sm p-3 ${RADIUS.circle} ${TRANSITIONS.hover.scale} hover:bg-white/30`}
      aria-label={social.name}
    >
      {social.icon}
    </a>
  );
});

SocialMediaLink.displayName = 'SocialMediaLink';

// Memoized ContactDetail component
const ContactDetail = memo(({ icon: Icon, children }) => (
  <div className="flex items-start gap-3 sm:gap-4">
    <div className={`bg-white/20 p-2.5 sm:p-3 ${RADIUS.circle} backdrop-blur-sm`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <div>
      {children}
    </div>
  </div>
));

ContactDetail.displayName = 'ContactDetail';

const ContactInfo = () => {
  const { trackSocialClick, deviceType } = useAnalytics();

  const handleSocialMediaClick = (platform, url) => {
    trackSocialClick(platform, url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative h-full"
    >
      {/* Contact Info Box with Design System */}
      <div 
        className={`${RADIUS.image.responsive} p-6 sm:p-8 lg:p-12 text-white shadow-card-xl relative overflow-hidden h-full flex flex-col justify-between`}
        style={{ background: 'linear-gradient(to bottom right, #3962a8, #f0a97a)' }}
      >
        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mb-20"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/5 rounded-full"></div>

        <div className="relative z-10 flex-1 flex flex-col">
          <h2 className={`${TYPOGRAPHY.subheading.responsive} ${TYPOGRAPHY.weight.bold} mb-3 sm:mb-4`}>
            Contact Information
          </h2>
          <p className={`text-white/90 mb-8 sm:mb-10 lg:mb-12 leading-relaxed ${TYPOGRAPHY.body.small} sm:${TYPOGRAPHY.body.regular}`}>
            Should you have any question or concern, you can reach us by filling out the contact form, calling us, finding us on other social networks, or you can personal email us at :
          </p>

          {/* Contact Details */}
          <div className="space-y-6 sm:space-y-8 flex-1">
            {/* Phone */}
            <ContactDetail icon={Phone}>
              <p className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} sm:${TYPOGRAPHY.body.default}`}>
                {contactInfo.phone}
              </p>
            </ContactDetail>

            {/* Email */}
            <ContactDetail icon={Mail}>
              <p className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.regular} sm:${TYPOGRAPHY.body.default}`}>
                {contactInfo.email}
              </p>
            </ContactDetail>

            {/* Address */}
            <ContactDetail icon={MapPin}>
              <p className={`${TYPOGRAPHY.weight.bold} leading-relaxed ${TYPOGRAPHY.body.small} sm:${TYPOGRAPHY.body.regular}`}>
                {contactInfo.address.line1}<br />
                {contactInfo.address.line2}<br />
                {contactInfo.address.line3}
              </p>
            </ContactDetail>
          </div>

          {/* Social Media Icons with Tracking */}
          <div className="mt-auto pt-6 sm:pt-8 border-t border-white/20">
            <div className="flex gap-3 sm:gap-4 justify-center">
              {socialMediaLinks.map((social) => (
                <SocialMediaLink 
                  key={social.name} 
                  social={social}
                  onSocialClick={handleSocialMediaClick}
                />
              ))}
            </div>
            
            {/* Optional: Device type indicator for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-center text-xs text-white/50 mt-2">
                Device: {deviceType}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ContactInfo);
