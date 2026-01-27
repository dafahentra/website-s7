// ========================================
// hooks/useAnalytics.js - EXTENDED VERSION
// ========================================
import { useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { 
trackWhatsAppClick, 
trackButtonClick, 
trackNavigation,
trackExternalLink,
trackCustomEvent,
  trackSocialMediaClick,     // ✨ NEW
  trackContactFormSubmit,    // ✨ NEW
  detectDeviceType           // ✨ NEW
} from '../utils/analytics';

/**
 * Custom Hook untuk Analytics Tracking
 * Provides easy-to-use tracking functions with automatic device detection
 * 
 * CHANGELOG:
 * - Added automatic device type detection with resize listener
 * - Added trackSocialClick function for social media tracking
 * - Added trackFormSubmit for contact form tracking
 * - Device type is now automatically detected and included in all events
 */
export const useAnalytics = () => {
const location = useLocation();
const [deviceType, setDeviceType] = useState('desktop');

  // Auto-detect device type on mount and resize
useEffect(() => {
    // Initial detection
    const currentDevice = detectDeviceType();
    setDeviceType(currentDevice);

    // Listen for window resize
    const handleResize = () => {
    const newDevice = detectDeviceType();
    if (newDevice !== deviceType) {
        setDeviceType(newDevice);
        
        // Optional: Track device type changes
        if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Device type changed: ${newDevice}`);
        }
    }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
}, [deviceType]);

  // Track WhatsApp Order Click dengan automatic device detection
const trackWhatsAppOrder = useCallback((customDevice) => {
    // Allow manual override, otherwise use detected device
    const device = customDevice || deviceType;
    trackWhatsAppClick(device, location.pathname);
}, [deviceType, location.pathname]);

  // Track Social Media Click - NEW FUNCTION ✨
const trackSocialClick = useCallback((platform, url) => {
    trackSocialMediaClick(platform, deviceType, location.pathname, url);
}, [deviceType, location.pathname]);

  // Track Contact Form Submit - NEW FUNCTION ✨
const trackFormSubmit = useCallback((success = true) => {
    trackContactFormSubmit(deviceType, success);
}, [deviceType]);

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
    // Existing functions
    trackWhatsAppOrder,
    trackButton,
    trackNav,
    trackLink,
    trackEvent,
    
    // New functions ✨
    trackSocialClick,      // For social media tracking
    trackFormSubmit,       // For form submission tracking
    
    // Device info
    deviceType,            // Current device type ('mobile' or 'desktop')
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
};
};

export default useAnalytics;