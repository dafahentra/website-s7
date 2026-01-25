import React from "react";
import SEO from "../components/SEO";
import Hero from "../components/Hero";
import Story from "../components/Story";
import News from "../components/News";
import Promo from "../components/Promo";
import Testimoni from "../components/Testimoni";
import Follow from "../components/Follow";
import Contact from "../components/Contact";

const Home = () => {
return (
    <>
    <SEO 
        title="Sector Seven Coffee - Premium Coffee Experience in Yogyakarta"
        description="Experience the finest specialty coffee at Sector Seven Coffee. Located in Digital Lounge CIMB Niaga, UGM. Enjoy our espresso, manual brew, and signature drinks. Open daily 07:30-17:00."
        keywords="sector seven coffee, coffee shop yogyakarta, premium coffee, espresso yogyakarta, manual brew, specialty coffee, cimb niaga ugm, coffee ugm, kedai kopi ugm, kopi premium jogja"
        url="/"
        image="/og-image.jpg"
    />
    
    <Hero />
    <Story />
    <News />
    <Promo />
    <Testimoni />
    <Follow />
    <Contact />
    </>
);
};

export default Home;