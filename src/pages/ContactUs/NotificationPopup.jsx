// components/ContactUs/NotificationPopup.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../../styles/designSystem";

const NotificationPopup = ({ show, type, onClose }) => {
  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full max-w-md"
          >
            <div className={`${RADIUS.card.responsive} ${SHADOWS.image.responsive} p-6 flex items-center gap-4 ${
              isSuccess 
                ? 'bg-brand-green text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.default} mb-1`}>
                  {isSuccess ? 'Message Sent!' : 'Failed to Send'}
                </h3>
                <p className={`${TYPOGRAPHY.body.small} opacity-90`}>
                  {isSuccess 
                    ? 'Thank you for contacting us. We will respond to your message promptly'
                    : 'An error occurred. Please try again or contact us via email/phone'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className={`text-white hover:bg-white/20 ${RADIUS.circle} p-2 ${TRANSITIONS.hover.color}`}
                aria-label="Close notification"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default memo(NotificationPopup);