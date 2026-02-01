// hooks/useContactForm.js - SIMPLE VERSION
import { useState } from 'react';

export const useContactForm = () => {
const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [showNotification, setShowNotification] = useState(false);
const [notificationType, setNotificationType] = useState('success');

  // Handle all input changes (including phone)
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

  // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
    const response = await fetch('https://formsubmit.co/dapahentra@gmail.com', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        _subject: '📧 Pesan Baru dari Website Sector Seven',
        _captcha: 'false',
        _template: 'table'
        })
    });

    if (response.ok) {
        setNotificationType('success');
        setShowNotification(true);
        
        // Reset form
        setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
        });

        // Auto hide notification after 5 seconds
        setTimeout(() => {
        setShowNotification(false);
        }, 5000);
    } else {
        throw new Error('Submission failed');
    }
    } catch (error) {
    console.error('Error submitting form:', error);
    setNotificationType('error');
    setShowNotification(true);

      // Auto hide error notification after 5 seconds
    setTimeout(() => {
        setShowNotification(false);
    }, 5000);
    } finally {
    setIsSubmitting(false);
    }
};

  // Manual hide notification
const hideNotification = () => {
    setShowNotification(false);
};

return {
    formData,
    isSubmitting,
    showNotification,
    notificationType,
    handleChange,
    handleSubmit,
    hideNotification
};
};
