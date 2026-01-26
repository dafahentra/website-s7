import React, { useState } from "react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

const Store = () => {

// Data Store Locations
const stores = [
{
    id: 1,
    name: "Digital Lounge CIMB Niaga",
    address: "Jl. Sosio Humaniora, Karang Malang, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
    hours: "07:30 - 17:00",
    phone: "+62 274 1234570",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop",
    mapUrl: "https://maps.app.goo.gl/L3eQo8ZSP4pf2n6z7"
}
];

return (
<>
    <SEO 
    title="Our Store Location - Sector Seven Coffee"
    description="Visit Sector Seven Coffee at Digital Lounge CIMB Niaga, UGM Yogyakarta. Open daily 07:30-17:00. Find directions and contact information."
    keywords="sector seven location, coffee shop ugm, cimb niaga digital lounge, sector seven address, coffee shop yogyakarta location"
    url="/store"
    image="/og-image.jpg"
    />

    <div className="pt-32 min-h-screen bg-white">
    {/* Google Maps Section - FIRST */}
    <div className="w-full mb-16">
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        >
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.183466671462!2d110.37701477432212!3d-7.770360577077156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59499ed0ac3d%3A0x8be5eaf4d123323d!2sCIMB%20Niaga%20Digital%20Lounge%20FEB%20UGM!5e0!3m2!1sen!2sid!4v1769270121717!5m2!1sen!2sid"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sector Seven Store Locations"
        ></iframe>
        </motion.div>
    </div>

    {/* Header - SECOND */}
    <div className="text-center mb-12 px-4">
        <h1 className="text-6xl font-bold text-[#1d3866]">Our Store</h1>
    </div>

    {/* Store List Section */}
    <div className="max-w-[1300px] mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
        {stores.map((store, index) => (
            <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
            <div className="flex flex-col sm:flex-row">
                {/* Store Image */}
                <div className="w-full sm:w-[240px] h-[200px] sm:h-auto flex-shrink-0">
                <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                />
                </div>

                {/* Store Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {store.name}
                    </h3>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-600 leading-relaxed text-sm">{store.address}</p>
                    </div>

                    {/* Google Maps Link */}
                    <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2c5530] hover:underline text-sm font-medium mb-4 inline-block"
                    onClick={(e) => e.stopPropagation()}
                    >
                    See on Google Maps
                    </a>

                    {/* Operating Hours */}
                    <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#2c5530] rounded-full"></div>
                    <p className="text-gray-900 font-medium text-sm">{store.hours}</p>
                    </div>
                </div>
                </div>
            </div>
            </motion.div>
        ))}
        </div>
    </div>
    </div>
</>
);
};

export default Store;