// ========================================
// 2. Contact.jsx - CLEANED (Remove Unused Icons)
// ========================================
import React from "react";
import logo from "../assets/logo.png";

// ✅ ONLY keep WhatsAppIcon - remove unused icons
const WhatsAppIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const Contact = () => {
  return (
    <div className="max-w-[1200px] mx-auto mt-20 mb-5">
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
          <div className="flex gap-2 items-center">
            <WhatsAppIcon size={25} />
            <span className="text-[#1e4a3c] text-sm">0895 3671 63744</span>
          </div>
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

      <div className="mx-4 mt-6 flex lg:flex-row flex-col lg:space-y-0 lg:justify-between justify-start space-y-10 items-center">
        <span className="text-[#1e4a3c] text-sm">
          © 2025 SECTOR SEVEN, All Rights Reserved
        </span>
      </div>
    </div>
  );
};

export default React.memo(Contact);