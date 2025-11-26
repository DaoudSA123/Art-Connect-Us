import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const ContactForm = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // TODO: Integrate EmailJS here
    // Example structure:
    // import emailjs from '@emailjs/browser';
    // 
    // try {
    //   const result = await emailjs.send(
    //     'YOUR_SERVICE_ID',
    //     'YOUR_TEMPLATE_ID',
    //     {
    //       from_name: formData.name,
    //       from_email: formData.email,
    //       subject: formData.subject,
    //       message: formData.message,
    //     },
    //     'YOUR_PUBLIC_KEY'
    // );
    //   console.log('Email sent successfully:', result);
    //   setIsSubmitted(true);
    // } catch (error) {
    //   console.error('Email sending failed:', error);
    //   setError('Failed to send message. Please try again.');
    // } finally {
    //   setIsSubmitting(false);
    // }

    // Simulate form submission for now
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      // Reset form after showing success message
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setIsSubmitted(false);
        onClose();
      }, 3000);
    }, 1000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setError('');
      setIsSubmitted(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
        margin: 0,
        boxSizing: 'border-box'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#0a0a0a',
          border: '2px solid #3A2E28',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: '#9ca3af',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'color 0.3s ease',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) e.target.style.color = '#9ca3af';
          }}
          aria-label="Close contact form"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#4A6FA5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ffffff',
                marginBottom: '8px',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                Get In Touch
              </h2>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                We'd love to hear from you
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                {error}
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    color: '#d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #4b5563',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4A6FA5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 111, 165, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    color: '#d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #4b5563',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4A6FA5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 111, 165, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="subject"
                  style={{
                    display: 'block',
                    color: '#d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #4b5563',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4A6FA5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 111, 165, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  style={{
                    display: 'block',
                    color: '#d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={6}
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #4b5563',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4A6FA5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 111, 165, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4b5563';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#4A6FA5',
                  color: '#ffffff',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 'bold',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  border: '1px solid #4A6FA5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  transform: isSubmitting ? 'none' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#5B7FB8';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#4A6FA5';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
                onFocus={(e) => {
                  e.target.style.outline = '2px solid #4A6FA5';
                  e.target.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
              >
                {isSubmitting ? 'SENDING...' : 'Send Message'}
              </button>
              
              {/* Privacy Policy Link */}
              <p style={{
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '12px',
                color: '#9ca3af',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                By submitting this form, you agree to our{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    navigate('/privacy-policy');
                  }}
                  style={{
                    color: '#4A6FA5',
                    textDecoration: 'underline',
                    transition: 'color 0.3s ease',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#5B7FB8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4A6FA5';
                  }}
                >
                  Privacy Policy
                </button>
              </p>
            </form>
          </>
        ) : (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#059669',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#ffffff',
              marginBottom: '8px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              Message Sent!
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              We'll get back to you soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render to document.body using portal to ensure consistent positioning
  return createPortal(modalContent, document.body);
};

export default ContactForm;

