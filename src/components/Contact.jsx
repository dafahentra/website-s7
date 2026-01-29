// ========================================
// components/Contact.jsx - WITH TRACKING (Footer Component)
// ========================================
import React from "react";
import logo from "../assets/logo.png";
import { useAnalytics } from "../hooks/useAnalytics"; // ✨ Import analytics

// Social Media Icons (same as before)
const WhatsAppIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const InstagramIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const LinkedInIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Social Media Configuration
const SOCIAL_MEDIA_CONFIG = [
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/company/sector-seven-id",
    icon: LinkedInIcon,
    color: "#0077b5"
  },
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com/@sectorseven.id?_r=1&_t=ZS-93PsAy0pkzY",
    icon: TikTokIcon,
    color: "#000000"
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://instagram.com/sectorseven.yk",
    icon: InstagramIcon,
    color: "#E4405F"
  }
];

// ✨ Reusable Social Media Links Component with Tracking
const SocialMediaLinks = ({ className = "", size = 28 }) => {
  const { trackSocialClick, deviceType } = useAnalytics();

  const handleSocialClick = (platform, url) => {
    trackSocialClick(platform, url);
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {SOCIAL_MEDIA_CONFIG.map(({ id, name, url, icon: Icon, color }) => (
        <a
          key={id}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick(id, url)}
          className={`text-[#1e4a3c] transition-colors duration-200 ${
            deviceType === 'mobile' 
              ? 'active:opacity-70' 
              : 'hover:opacity-70'
          }`}
          aria-label={name}
          style={{ '--hover-color': color }}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
};

const Contact = () => {
  const { trackWhatsAppOrder } = useAnalytics();

  return (
    <div className="max-w-[1200px] mx-auto mt-20 mb-16">
      <div className="flex lg:flex-row flex-col gap-4 mx-4 lg:items-start items-center">
        <div className="lg:w-1/3">
          <img src={logo} alt="logo" width={200} className="bg-cover" />
        </div>
        <div className="lg:w-1/3 text-wrap">
          <h3 className="mb-2 text-[#1e4a3c] font-bold">Our Store</h3>
          <div className="flex gap-2 mb-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[#1e4a3c] text-sm">CIMB Niaga Digital Lounge FEB UGM</span>
          </div>
          <div className="flex gap-2 mb-2 ml-8">
            <p className="text-[#1e4a3c] text-sm">
              Jl. Sosio Humaniora, Karang Malang, Caturtunggal, 
              Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta
            </p>
          </div>
          <button
            onClick={() => trackWhatsAppOrder()}
            className="flex gap-2 items-center hover:opacity-80 transition-opacity"
          >
            <WhatsAppIcon size={25} />
            <span className="text-[#1e4a3c] text-sm">0851 1104 2497</span>
          </button>
        </div>
        
        {/* Google Maps Embed */}
        <div className="lg:w-1/3 w-full">
          <h3 className="mb-2 text-[#1e4a3c] font-bold">Find Us At Maps</h3>
          <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d284.3057497352083!2d110.37947072586357!3d-7.770278069848001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59499ed0ac3d%3A0x8be5eaf4d123323d!2sCIMB%20Niaga%20Digital%20Lounge%20FEB%20UGM!5e0!3m2!1sen!2sid!4v1769237979418!5m2!1sen!2sid"
              width="100%"
              height="120"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Kami"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Social Media Links - Mobile only (below maps) */}
      <div className="mx-4 mt-8 lg:hidden">
        <SocialMediaLinks className="justify-center" size={28} />
      </div>

      <div className="mx-4 mt-12 pb-12 flex lg:flex-row flex-col lg:space-y-0 lg:justify-between justify-start space-y-10 items-center">
        <span className="text-[#1e4a3c] text-sm">
          © 2025 SECTOR SEVEN, All Rights Reserved
        </span>
        
        {/* Social Media Links - Desktop only (right side) */}
        <div className="hidden lg:flex lg:justify-end">
          <SocialMediaLinks size={28} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Contact);