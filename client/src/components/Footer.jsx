import React, { useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';
import ContactForm from './ContactForm';

const Footer = ({ isContactFormOpen: externalIsOpen, setIsContactFormOpen: externalSetIsOpen }) => {
  const [footerRef, footerVisible] = useScrollAnimation(0.1);
  // Use external state if provided, otherwise use internal state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isContactFormOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsContactFormOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;
  
  // Newsletter signup state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    // Remove formatting to get just digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (!digitsOnly || digitsOnly.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError(''); // Clear any previous errors
    setIsSubmitting(true);
    
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: digitsOnly }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSubscribed(true);
        setError(''); // Clear any errors on success
        setPhoneNumber(''); // Clear the input
        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSubscribed(false);
        }, 5000);
      } else {
        setError(data.message || 'Failed to subscribe. Please try again.');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer 
      ref={footerRef} 
      className={`bg-luxury-black border-t-2 border-denim-brown/30 py-12 md:py-16 px-6 md:px-8 relative ${footerVisible ? 'fade-in-on-scroll visible' : 'fade-in-on-scroll'}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-12">
          {/* Left: Social Media Icons */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xs md:text-sm font-street font-bold uppercase tracking-widest text-gray-400/70 mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.tiktok.com/@denimconnector" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-denim-blue hover:text-denim-blue-light transition-all duration-300 hover:scale-110 group"
                aria-label="Follow us on TikTok"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/artconnect.us" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-denim-blue hover:text-denim-blue-light transition-all duration-300 hover:scale-110 group"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Center: Contact Link */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xs md:text-sm font-street font-bold uppercase tracking-widest text-gray-400/70 mb-4">
              Get In Touch
            </h4>
            <button 
              onClick={() => setIsContactFormOpen(true)}
              className="bg-denim-blue text-white font-street font-bold px-6 py-2.5 hover:bg-denim-blue-light transition-all duration-300 uppercase tracking-wider text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2 inline-block cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Right: Newsletter Signup */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xs md:text-sm font-street font-bold uppercase tracking-widest text-gray-400/70 mb-4">
              Newsletter
            </h4>
            <div className="w-full max-w-sm">
              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="w-full">
                  <div className={`flex border ${error ? 'border-red-500/50' : 'border-gray-700/50'} hover:border-denim-blue/50 transition-colors duration-300`}>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(123) 456-7890"
                      maxLength="14"
                      className="flex-1 bg-luxury-black/80 border-0 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-0 transition-colors duration-300 text-sm placeholder-gray-500/60"
                    />
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-denim-blue text-white font-street font-bold px-4 md:px-5 py-2.5 hover:bg-denim-blue-light transition-all duration-300 uppercase tracking-wider text-xs focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2 border-l border-denim-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '...' : 'Subscribe'}
                    </button>
                  </div>
                  {/* Error Message */}
                  {error && (
                    <div 
                      style={{
                        marginTop: '12px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        transform: 'translateY(0)',
                        opacity: 1,
                        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#fca5a5' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p style={{
                        color: '#fca5a5',
                        fontSize: '13px',
                        fontFamily: 'Arial, sans-serif',
                        margin: 0,
                        lineHeight: '1.6',
                        fontWeight: '500',
                        letterSpacing: '0.01em',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        paddingTop: '1px'
                      }}>
                        {error}
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    transform: 'translateY(0)',
                    opacity: 1,
                    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6ee7b7' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p style={{
                    color: '#6ee7b7',
                    fontSize: '13px',
                    fontFamily: 'Arial, sans-serif',
                    margin: 0,
                    lineHeight: '1.5',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Subscribed! Check your phone for updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-denim-brown/20 pt-8 md:pt-10">
          <p className="text-gray-400/60 text-xs md:text-sm text-center font-street font-medium uppercase tracking-widest">
            © 2024 Art Connect Us. All rights reserved.
          </p>
        </div>
      </div>
      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
    </footer>
  );
};

export default Footer;
