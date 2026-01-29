// src/components/ui/Section.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { SPACING, cn } from '../../styles/designSystem';

/**
 * Standardized Section Wrapper Component
 * Provides consistent spacing and container for page sections
 * 
 * @param {Object} props
 * @param {'white'|'cream'|'gradient'} props.background - Background style
 * @param {boolean} props.container - Apply container max-width and padding
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Section content
 * 
 * @example
 * <Section background="white" container>
 *   <Heading variant="page" center>Our Story</Heading>
 *   ...content
 * </Section>
 */
const Section = ({ 
  background = 'white',
  container = true,
  className = '',
  children,
  ...props
}) => {
  // Background classes
  const getBackgroundClasses = () => {
    const bgMap = {
      white: 'bg-white',
      cream: 'bg-brand-cream',
      gradient: 'bg-gradient-to-b from-white to-gray-50',
    };
    
    return bgMap[background] || 'bg-white';
  };

  const sectionClasses = cn(
    SPACING.section.responsive,
    getBackgroundClasses(),
    className
  );

  return (
    <section className={sectionClasses} {...props}>
      {container ? (
        <div className={SPACING.container.centered}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

Section.propTypes = {
  background: PropTypes.oneOf(['white', 'cream', 'gradient']),
  container: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Section;