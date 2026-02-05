// pages/About/ValuesSection.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import { Heading, Section } from "../../components/ui";
import { TYPOGRAPHY, TRANSITIONS } from "../../styles/designSystem";

const ValueCard = ({ icon, title, description, colorClasses, delay }) => {
  const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div
      ref={cardRef}
      className={`text-center ${TRANSITIONS.slow} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      <div className={`w-40 h-40 mx-auto mb-6 rounded-full border-4 flex items-center justify-center ${colorClasses.border}`}>
        {icon}
      </div>
      <h3 className={`${TYPOGRAPHY.subheading.tablet} ${TYPOGRAPHY.weight.bold} mb-4 ${colorClasses.text}`}>
        {title}
      </h3>
      <div className={`${TYPOGRAPHY.body.responsive} text-gray-700 leading-relaxed`}>
        {description}
      </div>
    </div>
  );
};

const ValuesSection = () => {
  const values = [
    {
      colorClasses: {
        border: "border-brand-orange",
        text: "text-brand-orange"
      },
      title: "We Keep It Real",
      description: (
        <>
          Transparent about what we use. Honest about what we can do. <span className="font-bold">No fluff. No pretense. Just truth.</span>
        </>
      ),
      icon: (
        <svg className="w-20 h-20 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ),
      delay: 100
    },
    {
      colorClasses: {
        border: "border-brand-navy",
        text: "text-brand-navy"
      },
      title: "We Lift Each Other",
      description: (
        <>
          Students grow here. Farmers earn fairly. Baristas learn skills. <span className="font-bold">Everyone wins when we work together as family.</span>
        </>
      ),
      icon: (
        <svg className="w-20 h-20 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      delay: 200
    },
    {
      colorClasses: {
        border: "border-brand-orange",
        text: "text-brand-orange"
      },
      title: "We Put Heart In",
      description: (
        <>
          Quality ingredients. Careful preparation. Genuine hospitality. <span className="font-bold">We care about what we make and who we serve deeply.</span>
        </>
      ),
      icon: (
        <svg className="w-20 h-20 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      delay: 300
    },
    {
      colorClasses: {
        border: "border-brand-navy",
        text: "text-brand-navy"
      },
      title: "We Show Up Daily",
      description: (
        <>
          Consistent quality. Reliable service. Steady presence. <span className="font-bold">We do not just talk about excellence. We practice it every day.</span>
        </>
      ),
      icon: (
        <svg className="w-20 h-20 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      delay: 400
    }
  ];

  return (
    <Section background="white">
      <Heading as="h2" variant="page" color="navy" center>
        Our Values
      </Heading>
      <p className={`text-center text-gray-600 mb-element-md max-w-3xl mx-auto ${TYPOGRAPHY.body.default}`}>
        These values are the common language that truly captures the spirit of how we always do things.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => (
          <ValueCard
            key={index}
            icon={value.icon}
            title={value.title}
            description={value.description}
            colorClasses={value.colorClasses}
            delay={value.delay}
          />
        ))}
      </div>
    </Section>
  );
};

export default React.memo(ValuesSection);
