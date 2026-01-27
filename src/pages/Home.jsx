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
        title="Home - SECTOR SEVEN"
        description="Experience the finest specialty coffee & matcha at SECTOR SEVEN. Located in Digital Lounge CIMB Niaga, FEB UGM. Enjoy our espresso, pure matcha, and signature drinks. Open daily 07:30-17:00."
        keywords="sector seven ugm, sector seven matcha, sector seven coffee, coffee shop yogyakarta, premium coffee, espresso yogyakarta, manual brew, specialty coffee, cimb niaga ugm, coffee ugm, kedai kopi ugm, kopi premium jogja, matcha jogja, matcha murah jogja, matcha ceremonial jogja"
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