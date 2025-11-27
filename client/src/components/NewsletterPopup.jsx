import React, { useState, useEffect } from 'react';

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Show popup after 3 seconds on first visit (only if not dismissed before)
  useEffect(() => {
    // Check if popup has been dismissed before
    const hasBeenDismissed = localStorage.getItem('acu-newsletter-popup-seen');
    
    if (hasBeenDismissed === 'true') {
      console.log('NewsletterPopup: Already dismissed, not showing');
      return;
    }
    
    console.log('NewsletterPopup: Component mounted, setting timer...');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use Render backend URL in production, localhost in development
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSubscribed(true);
        
        // Close popup after 3 seconds
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        alert(data.message || 'Failed to subscribe. Please try again.');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.5s ease-out',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {console.log('NewsletterPopup: Rendering, isVisible:', isVisible)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

            {/* Email Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #4b5563',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4A6FA5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(74, 111, 165, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#4b5563';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />

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
