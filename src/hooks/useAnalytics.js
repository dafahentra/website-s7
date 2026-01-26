// ========================================
// 2. hooks/useAnalytics.js - NEW FILE
// ========================================
import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { 
trackWhatsAppClick, 
trackButtonClick, 
trackNavigation,
trackExternalLink,
trackCustomEvent 
} from '../utils/analytics';

/**
 * Custom Hook untuk Analytics Tracking
 * Provides easy-to-use tracking functions with automatic location detection
 */
export const useAnalytics = () => {
const location = useLocation();

  // Track WhatsApp Order Click dengan device detection
const trackWhatsAppOrder = useCallback((device) => {
    trackWhatsAppClick(device, location.pathname);
}, [location.pathname]);

  // Track Generic Button Click
const trackButton = useCallback((buttonName) => {
    trackButtonClick(buttonName, location.pathname);
}, [location.pathname]);

  // Track Navigation
const trackNav = useCallback((menuItem) => {
    trackNavigation(menuItem, location.pathname);
}, [location.pathname]);

  // Track External Link
const trackLink = useCallback((url, linkText) => {
    trackExternalLink(url, linkText);
}, []);

  // Track Custom Event
const trackEvent = useCallback((eventName, params) => {
    trackCustomEvent(eventName, params);
}, []);

return {
    trackWhatsAppOrder,
    trackButton,
    trackNav,
    trackLink,
    trackEvent,
};
};

export default useAnalytics;