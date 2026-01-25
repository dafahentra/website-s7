// pages/About/index.jsx
import React from "react";
import SEO from "../../components/SEO";
import HeroSection from "./HeroSection";
import StorySection from "./StorySection";
import ValuesSection from "./ValuesSection";
import TestimonialSlider from "./TestimonialSlider";
import BoardOfDirectors from "./BoardOfDirectors";
import MilestoneSection from "./MilestoneSection";
import News from "../../components/News";
import Contact from "../../components/Contact";
import { bodMembers, milestones, customerTestimonials } from "../../data/aboutData";

const About = () => {
return (
<>
    <SEO 
    title="About Us - Sector Seven Coffee | Our Story & Values"
    description="Discover the story behind Sector Seven Coffee. Learn about our passion for specialty coffee, commitment to quality, and our journey in bringing premium coffee experience to Yogyakarta."
    keywords="sector seven about, coffee story yogyakarta, specialty coffee story, our values, sector seven team, coffee passion, premium coffee yogyakarta"
    url="/about"
    image="/og-image.jpg"
    />
    
    <div className="pt-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
    <HeroSection />
    <StorySection />
    <ValuesSection />
    <TestimonialSlider testimonials={customerTestimonials} />
    <BoardOfDirectors members={bodMembers} />
    <News />
    <MilestoneSection milestones={milestones} />
    <Contact />
    </div>
</>
);
};

export default About;