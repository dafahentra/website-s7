// ========================================
// 1. utils/analytics.js - NEW FILE
// ========================================
/**
 * Google Analytics Utility Functions
 * Handles all GA4 event tracking for the application
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
    console.log(`📊 Analytics: WhatsApp clicked on ${device} from ${location}`);
} else {
    console.warn('Google Analytics (gtag) is not available');
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
