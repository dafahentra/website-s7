// src/components/ui/Heading.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { TYPOGRAPHY, SPACING, cn } from '../../styles/designSystem';

/**
 * Standardized Heading Component
 * 
 * @param {Object} props
 * @param {'h1'|'h2'|'h3'} props.as - HTML heading element
 * @param {'hero'|'page'|'section'} props.variant - Heading size variant
 * @param {'navy'|'orange'|'green'|'purple'|'blue'|'white'} props.color - Text color
 * @param {boolean} props.center - Center align text
 * @param {boolean} props.gradient - Apply gradient text effect
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Content
 * 
 * @example
 * <Heading as="h2" variant="page" color="navy" center>Our Story</Heading>
 * <Heading as="h3" variant="section" color="orange">Milestone Title</Heading>
 */
const Heading = ({ 
    as: Component = 'h2',
    variant = 'page',
    color = 'navy',
    center = false,
    gradient = false,
    className = '',
    children,
    ...props
}) => {
  // Get typography classes based on variant
    const getVariantClasses = () => {
    switch (variant) {
        case 'hero':
        return TYPOGRAPHY.hero.responsive;
        case 'page':
        return TYPOGRAPHY.heading.responsive;
        case 'section':
        return TYPOGRAPHY.subheading.responsive;
        default:
        return TYPOGRAPHY.heading.responsive;
    }
};

  // Get color classes
const getColorClasses = () => {
    if (gradient) {
    return 'bg-gradient-to-r from-brand-orange to-brand-navy bg-clip-text text-transparent';
    }
    
    const colorMap = {
    navy: 'text-brand-navy',
    orange: 'text-brand-orange',
    green: 'text-brand-green',
    purple: 'text-brand-purple',
    blue: 'text-brand-blue',
    white: 'text-white',
    };
    
    return colorMap[color] || 'text-brand-navy';
};

  // Get spacing classes based on variant
const getSpacingClasses = () => {
    switch (variant) {
    case 'hero':
        return 'mb-4 md:mb-6';
    case 'page':
        return SPACING.element.responsive;
    case 'section':
        return SPACING.element.mobile;
    default:
        return SPACING.element.mobile;
    }
};

const classes = cn(
    getVariantClasses(),
    TYPOGRAPHY.weight.bold,
    getColorClasses(),
    getSpacingClasses(),
    center && 'text-center',
    className
);

return (
    <Component className={classes} {...props}>
    {children}
    </Component>
);
};

Heading.propTypes = {
    as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4']),
    variant: PropTypes.oneOf(['hero', 'page', 'section']),
    color: PropTypes.oneOf(['navy', 'orange', 'green', 'purple', 'blue', 'white']),
    center: PropTypes.bool,
    gradient: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default Heading;