// src/components/ui/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { RADIUS, SHADOWS, cn } from '../../styles/designSystem';

/**
 * Standardized Card Component
 * Provides consistent styling for card-based layouts
 * 
 * @param {Object} props
 * @param {'default'|'hover'|'minimal'} props.variant - Card style variant
 * @param {boolean} props.shadow - Apply shadow (default: true)
 * @param {string} props.padding - Padding size (default: 'p-6 lg:p-8')
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Card content
 * 
 * @example
 * <Card variant="hover">
 *   <h3>Card Title</h3>
 *   <p>Card content...</p>
 * </Card>
 */
const Card = ({ 
variant = 'default',
shadow = true,
padding = 'p-6 lg:p-8',
className = '',
children,
...props
}) => {
const getVariantClasses = () => {
    switch (variant) {
    case 'hover':
        return 'transition-all duration-300 hover:shadow-card-xl hover:-translate-y-1';
    case 'minimal':
        return 'border border-gray-200';
    case 'default':
    default:
        return '';
    }
};

const classes = cn(
    'bg-white',
    RADIUS.card.responsive,
    shadow && SHADOWS.card.responsive,
    padding,
    getVariantClasses(),
    className
);

return (
    <div className={classes} {...props}>
    {children}
    </div>
);
};

Card.propTypes = {
    variant: PropTypes.oneOf(['default', 'hover', 'minimal']),
    shadow: PropTypes.bool,
    padding: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default Card;