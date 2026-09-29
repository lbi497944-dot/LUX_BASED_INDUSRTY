import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';
import {
  getReviewPageUrl,
  DEFAULT_REVIEW_MESSAGE,
  validateWhatsAppPhone,
  buildWhatsAppReviewUrl,
} from '../../utils/reviewWhatsApp';

export default function AdminSendReviewModal({ isOpen, onClose, onToast }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const phoneInputRef = useRef(null);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsOpening(false);
      setCopiedLink(false);
      setCopiedMessage(false);
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setPhone('');
      setError(null);
    }
  }, [isOpen]);

  // Keyboard navigation & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reviewUrl = getReviewPageUrl();
  const previewMessage = DEFAULT_REVIEW_MESSAGE;

  // Safe clipboard helper
  const copyToClipboard = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for environments lacking clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleCopyReviewLink = async () => {
    const success = await copyToClipboard(reviewUrl);
    if (success) {
      setCopiedLink(true);
      onToast?.({
        type: 'success',
        title: 'Link Copied',
        message: 'Review link copied.',
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      onToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy review link. Please copy it manually.',
      });
    }
  };

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(previewMessage);
    if (success) {
      setCopiedMessage(true);
      onToast?.({
        type: 'success',
        title: 'Message Copied',
        message: 'Review message copied.',
      });
      setTimeout(() => setCopiedMessage(false), 2500);
    } else {
      onToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy message. Please copy it manually.',
      });
    }
  };

  const handleSendWhatsApp = () => {
    if (isOpening) return; // Prevent duplicate clicks

    // Validate phone number
    const validation = validateWhatsAppPhone(phone);
    if (!validation.isValid) {
      setError(validation.error);
      phoneInputRef.current?.focus();
      return;
    }

    setError(null);
    setIsOpening(true);

    const result = buildWhatsAppReviewUrl(phone, previewMessage);
    if (!result.success) {
      setError(result.error);
      setIsOpening(false);
      return;
    }

    try {
      // Open WhatsApp in a new tab/window
      const win = window.open(result.url, '_blank', 'noopener,noreferrer');

      // Check if popup was blocked by browser
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setError(
          'Unable to open WhatsApp. Please check your browser popup settings or copy the review link manually.'
        );
        setIsOpening(false);
        return;
      }

      // Notify user accurately: WhatsApp is prepared and opened, NOT sent
      onToast?.({
        type: 'success',
        title: 'WhatsApp Prepared',
        message: 'WhatsApp opened with the review message.',
      });

      // Clear transient phone number state and close modal
      setPhone('');
      setError(null);
      setIsOpening(false);
      onClose();
    } catch {
      setError(
        'Unable to open WhatsApp. Please check your browser popup settings or copy the review link manually.'
      );
      setIsOpening(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="admin-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
      style={{ zIndex: 11000 }}
    >
      <div
        className="admin-modal admin-modal-dark admin-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-review-modal-title"
        aria-describedby="send-review-modal-subtitle"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '94%',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div className="admin-modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: 'rgba(230, 199, 122, 0.15)',
                border: '1px solid rgba(230, 199, 122, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold, #e6c77a)',
                flexShrink: 0,
              }}
            >
              <MessageCircle size={18} />
            </div>
            <div>
              <h2
                id="send-review-modal-title"
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 600,
                  color: 'var(--gold, #e6c77a)',
                  letterSpacing: '0.03em',
                }}
              >
                Send Review Link
              </h2>
              <p
                id="send-review-modal-subtitle"
                style={{
                  margin: '2px 0 0',
                  fontSize: '12px',
                  color: 'rgba(243, 243, 235, 0.65)',
                }}
              >
                Send a direct review link to a customer via WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body admin-form" style={{ padding: '20px' }}>
          {error && (
            <div
              className="admin-alert admin-alert-danger"
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* WhatsApp Phone Field */}
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label
              htmlFor="review-whatsapp-phone"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 600,
                fontSize: '12px',
                letterSpacing: '0.04em',
                color: '#FAF8F1',
              }}
            >
              WhatsApp Number *
            </label>
            <input
              id="review-whatsapp-phone"
              ref={phoneInputRef}
              type="tel"
              autoComplete="tel"
              placeholder="+91 95621 27245"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendWhatsApp();
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '5px',
                border: '1px solid rgba(230, 199, 122, 0.25)',
                background: '#0E1612',
                color: '#FAF8F1',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <small
              style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '11px',
                color: 'rgba(243, 243, 235, 0.55)',
              }}
            >
              Enter the customer&apos;s WhatsApp number with country code. Example: +91 95621 27245
            </small>
          </div>

          {/* Message Preview */}
          <div className="admin-form-group" style={{ marginBottom: '0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: '#FAF8F1',
                }}
              >
                Message Preview
              </span>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={handleCopyMessage}
                title="Copy entire message to clipboard"
                aria-label="Copy message text"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  padding: '3px 8px',
                }}
              >
                {copiedMessage ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedMessage ? 'COPIED' : 'COPY MESSAGE'}</span>
              </button>
            </div>

            <div
              style={{
                background: '#0E1612',
                color: 'rgba(243, 243, 235, 0.9)',
                borderRadius: '6px',
                border: '1px solid rgba(230, 199, 122, 0.18)',
                padding: '12px 14px',
                fontSize: '12px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
            >
              {previewMessage}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="admin-modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '14px 20px',
            borderTop: '1px solid rgba(230, 199, 122, 0.15)',
            backgroundColor: '#14351b',
          }}
        >
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
            disabled={isOpening}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyReviewLink}
              title="Copy public review link to clipboard"
              aria-label="Copy public review link"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'LINK COPIED' : 'COPY REVIEW LINK'}</span>
            </button>

            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={handleSendWhatsApp}
              disabled={isOpening}
              title="Open WhatsApp with prefilled review message"
              aria-label="Send via WhatsApp"
            >
              <MessageCircle size={15} />
              <span>{isOpening ? 'OPENING...' : 'SEND VIA WHATSAPP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
