// ========================================
// utils/analytics.js - EXTENDED VERSION
// ========================================
/**
 * Google Analytics Utility Functions
 * Handles all GA4 event tracking for the application
 * 
 * CHANGELOG:
 * - Added trackSocialMediaClick() for social media tracking
 * - Added trackContactFormSubmit() for form tracking
 * - Enhanced with device detection support
 */

/**
 * Track WhatsApp Order Button Click
 * @param {string} device - 'desktop' or 'mobile'
 * @param {string} location - Current page path
 */
export const trackWhatsAppClick = (device, location) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'whatsapp_order_click', {
    event_category: 'engagement',
    event_label: device,
    device_type: device,
    page_location: location,
    value: 1,
      // Custom dimensions untuk detailed analysis
      dimension1: device, // Device Type
      dimension2: location, // Page Location
    });

    // Optional: Console log untuk debugging (hapus di production)
    if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: WhatsApp clicked on ${device} from ${location}`);
    }
} else {
    console.warn('Google Analytics (gtag) is not available');
}
};

/**
 * Track Social Media Click - NEW FUNCTION ✨
 * @param {string} platform - Social media platform (instagram, tiktok, linkedin)
 * @param {string} device - 'desktop' or 'mobile'
 * @param {string} location - Current page path
 * @param {string} url - Destination URL
 */
export const trackSocialMediaClick = (platform, device, location, url) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'social_media_click', {
    event_category: 'social_engagement',
    event_label: platform,
    social_platform: platform,
    device_type: device,
    page_location: location,
    destination_url: url,
    timestamp: new Date().toISOString(),
      // Custom dimensions
      dimension1: device, // Device Type
      dimension2: platform, // Social Platform
      dimension3: location, // Page Location
    });

    // Development logging
    if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${platform} clicked on ${device} from ${location}`);
    }
} else {
    console.warn('Google Analytics (gtag) is not available');
}
};

/**
 * Track Contact Form Submit - NEW FUNCTION ✨
 * @param {string} device - 'desktop' or 'mobile'
 * @param {boolean} success - Whether form submission was successful
 */
export const trackContactFormSubmit = (device, success = true) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact_form_submit', {
    event_category: 'engagement',
    event_label: success ? 'success' : 'failed',
    device_type: device,
    form_status: success ? 'success' : 'failed',
    value: success ? 1 : 0,
    });

    if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: Contact form ${success ? 'submitted' : 'failed'} on ${device}`);
    }
}
};

/**
 * Track Button Click (Generic)
 * @param {string} buttonName - Name of the button
 * @param {string} location - Current page path
 */
export const trackButtonClick = (buttonName, location) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'button_click', {
    event_category: 'engagement',
    event_label: buttonName,
    page_location: location,
    });
}
};

/**
 * Track Navigation Click
 * @param {string} menuItem - Menu item clicked
 * @param {string} fromPage - Page navigated from
 */
export const trackNavigation = (menuItem, fromPage) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigation_click', {
    event_category: 'navigation',
    event_label: menuItem,
    from_page: fromPage,
    });
}
};

/**
 * Track External Link Click
 * @param {string} url - External URL
 * @param {string} linkText - Link text or description
 */
export const trackExternalLink = (url, linkText) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'external_link_click', {
    event_category: 'engagement',
    event_label: linkText,
    external_url: url,
    });
}
};

/**
 * Track Custom Event
 * @param {string} eventName - Name of the event
 * @param {object} params - Event parameters
 */
export const trackCustomEvent = (eventName, params = {}) => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
}
};

/**
 * Detect Device Type - UTILITY FUNCTION ✨
 * @returns {string} 'mobile' or 'desktop'
 */
export const detectDeviceType = () => {
if (typeof window === 'undefined') return 'desktop';

  // Using Tailwind's lg breakpoint (1024px) as threshold
return window.innerWidth < 1024 ? 'mobile' : 'desktop';
};