// hooks/usePageTracking.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTracking = () => {
const location = useLocation();

useEffect(() => {
if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-SCBHRPY0TP', {
    page_path: location.pathname + location.search,
    page_title: document.title,
    page_location: window.location.href
    });

    // Debug log (remove di production jika tidak perlu)
    if (process.env.NODE_ENV === 'development') {
    console.log('📊 Page tracked:', location.pathname);
    }
}
}, [location]);
};

export default usePageTracking;