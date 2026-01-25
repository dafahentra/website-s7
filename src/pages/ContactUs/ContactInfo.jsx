// components/ContactUs/ContactInfo.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { contactInfo, socialMediaLinks } from "../../data/contactData";

// Memoized SocialMediaLink component
const SocialMediaLink = memo(({ social }) => (
<a
    href={social.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all hover:scale-110"
    aria-label={social.name}
>
    {social.icon}
</a>
));

SocialMediaLink.displayName = 'SocialMediaLink';

// Memoized ContactDetail component
const ContactDetail = memo(({ icon: Icon, children }) => (
<div className="flex items-start gap-4">
    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
    <Icon className="w-6 h-6" />
    </div>
    <div>
    {children}
    </div>
</div>
));

ContactDetail.displayName = 'ContactDetail';

const ContactInfo = () => {
return (
    <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="relative h-full"
    >
      {/* Green Box with Info */}
    <div className="bg-gradient-to-br from-[#3962a8] to-[#f0a97a] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mb-20"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/5 rounded-full"></div>

        <div className="relative z-10 flex-1 flex flex-col">
        <h2 className="text-4xl font-bold mb-4">Contact Information</h2>
        <p className="text-white/90 mb-12 leading-relaxed">
            Should you have any question or concern, you can reach us by filling out the contact form, calling us, coming to our office, finding us on other social networks, or you can personal email us at :
        </p>

          {/* Contact Details */}
        <div className="space-y-8 flex-1">
            {/* Phone */}
            <ContactDetail icon={Phone}>
            <p className="font-bold text-lg">{contactInfo.phone}</p>
            </ContactDetail>

            {/* Email */}
            <ContactDetail icon={Mail}>
            <p className="font-bold text-lg">{contactInfo.email}</p>
            </ContactDetail>

            {/* Address */}
            <ContactDetail icon={MapPin}>
            <p className="font-bold leading-relaxed">
                {contactInfo.address.line1}<br />
                {contactInfo.address.line2}<br />
                {contactInfo.address.line3}
            </p>
            </ContactDetail>
        </div>

          {/* Social Media Icons */}
        <div className="mt-auto pt-8 border-t border-white/20">
            <div className="flex gap-4 justify-center">
            {socialMediaLinks.map((social) => (
                <SocialMediaLink key={social.name} social={social} />
            ))}
            </div>
        </div>
        </div>
    </div>
    </motion.div>
);
};

export default memo(ContactInfo);