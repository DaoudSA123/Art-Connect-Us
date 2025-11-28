import React, { useState, useEffect } from 'react';

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  // Show popup after 3 seconds (check if dismissed, but show anyway for testing)
  useEffect(() => {
    console.log('NewsletterPopup: Component mounted, setting timer...');
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      console.log('NewsletterPopup: Timer fired, setting visible to true');
      setIsVisible(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('acu-newsletter-popup-seen', 'true');
  };

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

  const handleSubmit = async (e) => {
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
      console.log('Submitting phone number:', digitsOnly);
      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: digitsOnly }),
      });

      const data = await response.json();
      console.log('Subscription response:', data);
      
      if (data.success) {
        setIsSubscribed(true);
        setError(''); // Clear any errors on success
        // Keep popup open so user can see the discount code until they click X
      } else {
        console.error('Subscription failed:', data.message, data);
        setError(data.message || 'Failed to subscribe. Please try again.');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Always render the popup (removed dismissal check for now)

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      <div 
        style={{
          position: 'relative',
          backgroundColor: '#0a0a0a',
          border: '2px solid #3A2E28',
          borderRadius: '16px',
          padding: '24px',
          width: '320px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(4px)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            color: '#9ca3af',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          aria-label="Close"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSubscribed ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#4A6FA5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ffffff',
                marginBottom: '4px',
                fontFamily: 'Arial, sans-serif'
              }}>
                Get 10% Off
              </h2>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif'
              }}>
                Subscribe for exclusive deals
              </p>
            </div>

            {/* Phone Number Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(123) 456-7890"
                maxLength="14"
                style={{
                  width: '100%',
                  backgroundColor: '#0a0a0a',
                  border: error ? '1px solid #ef4444' : '1px solid #4b5563',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#4A6FA5';
                  e.target.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : '0 0 0 3px rgba(74, 111, 165, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#4b5563';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              
              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
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
                    lineHeight: '1.5',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#4A6FA5',
                  color: '#ffffff',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #4A6FA5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  transform: isSubmitting ? 'none' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#5B7FB8';
                    e.target.style.transform = 'scale(1.05)';
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
                {isSubmitting ? 'SUBSCRIBING...' : 'Subscribe & Save 10%'}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#059669',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#ffffff',
              marginBottom: '8px',
              fontFamily: 'Arial, sans-serif'
            }}>
              Welcome!
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              marginBottom: '12px'
            }}>
              Use code at checkout
            </p>
            <div style={{
              backgroundColor: '#1e3a8a',
              border: '1px solid #059669',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                color: '#10b981',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                CODE: ACU10
              </div>
              <div style={{
                color: '#d1d5db',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                10% off instantly
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
