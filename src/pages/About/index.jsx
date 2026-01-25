// pages/About/index.jsx
import React from "react";
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
);
};

export default About;