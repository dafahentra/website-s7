// src/utils/analytics.js

export const trackWhatsAppClick = (device, location) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "whatsapp_order_click", {
      event_category: "engagement",
      event_label:    device,
      device_type:    device,
      page_location:  location,
      value:          1,
    });
    if (import.meta.env.DEV) {
      console.log(`📊 Analytics: WhatsApp clicked on ${device} from ${location}`);
    }
  }
};

export const trackSocialMediaClick = (platform, device, location, url) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "social_media_click", {
      event_category:  "social_engagement",
      event_label:     platform,
      social_platform: platform,
      device_type:     device,
      page_location:   location,
      destination_url: url,
    });
    if (import.meta.env.DEV) {
      console.log(`📊 Analytics: ${platform} clicked on ${device} from ${location}`);
    }
  }
};

export const trackContactFormSubmit = (device, success = true) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "contact_form_submit", {
      event_category: "engagement",
      event_label:    success ? "success" : "failed",
      device_type:    device,
      form_status:    success ? "success" : "failed",
      value:          success ? 1 : 0,
    });
    if (import.meta.env.DEV) {
      console.log(`📊 Analytics: Contact form ${success ? "submitted" : "failed"} on ${device}`);
    }
  }
};

export const trackButtonClick = (buttonName, location) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "button_click", {
      event_category: "engagement",
      event_label:    buttonName,
      page_location:  location,
    });
  }
};

export const trackNavigation = (menuItem, fromPage) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "navigation_click", {
      event_category: "navigation",
      event_label:    menuItem,
      from_page:      fromPage,
    });
  }
};

export const trackExternalLink = (url, linkText) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "external_link_click", {
      event_category: "engagement",
      event_label:    linkText,
      external_url:   url,
    });
  }
};

export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const detectDeviceType = () => {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 1024 ? "mobile" : "desktop";
};