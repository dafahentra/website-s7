// hooks/useContactForm.js
import { useState } from "react";
import { formSubmitConfig } from "../data/contactData";

export const useContactForm = () => {
const [formData, setFormData] = useState({
name: "",
email: "",
phone: "",
message: ""
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showNotification, setShowNotification] = useState(false);
const [notificationType, setNotificationType] = useState('success');

const handleChange = (e) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value
});
};

const resetForm = () => {
setFormData({
    name: "",
    email: "",
    phone: "",
    message: ""
});
};

const showSuccessNotification = () => {
setNotificationType('success');
setShowNotification(true);
setTimeout(() => {
    setShowNotification(false);
}, 5000);
};

const showErrorNotification = () => {
setNotificationType('error');
setShowNotification(true);
setTimeout(() => {
    setShowNotification(false);
}, 5000);
};

const hideNotification = () => {
setShowNotification(false);
};

const handleSubmit = async (e) => {
e.preventDefault();
setIsSubmitting(true);

try {
    // Prepare form data
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone || 'Not provided');
    formDataToSend.append('message', formData.message);
    formDataToSend.append('_subject', formSubmitConfig.subject);
    formDataToSend.append('_captcha', formSubmitConfig.captcha);
    formDataToSend.append('_template', formSubmitConfig.template);

    // Submit to FormSubmit
    const response = await fetch(formSubmitConfig.endpoint, {
    method: 'POST',
    body: formDataToSend,
    headers: {
        'Accept': 'application/json'
    }
    });

    if (response.ok) {
    showSuccessNotification();
    resetForm();
    } else {
    throw new Error('Failed to send');
    }
} catch (error) {
    console.error('Error:', error);
    showErrorNotification();
} finally {
    setIsSubmitting(false);
}
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