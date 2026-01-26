// hooks/useIntersectionObserver.js
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook untuk Intersection Observer
 * Menghilangkan duplikasi kode di berbagai komponen
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Threshold untuk trigger visibility (default: 0.2)
 * @param {string} options.rootMargin - Root margin untuk observer
 * @returns {Array} [elementRef, isVisible] - Ref untuk element dan status visibility
 * 
 * @example
 * const [cardRef, isVisible] = useIntersectionObserver({ threshold: 0.2 });
 */
const useIntersectionObserver = (options = {}) => {
const [isVisible, setIsVisible] = useState(false);
const elementRef = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
        if (entry.isIntersecting) {
        setIsVisible(true);
        }
    },
    {
        threshold: 0.2,
        ...options
    }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
    observer.observe(currentElement);
    }

    return () => {
    if (currentElement) {
        observer.unobserve(currentElement);
    }
    };
}, [options]);

return [elementRef, isVisible];
};

export default useIntersectionObserver;