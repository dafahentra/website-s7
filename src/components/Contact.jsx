import React from "react";
import logo from "../assets/logo.png";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaYoutube, FaTwitter } from "react-icons/fa";
import { AiFillInstagram, AiFillLinkedin } from "react-icons/ai";

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
              className="w-6 h-6"
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
            <IoLogoWhatsapp size={25} />
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

export default Contact;