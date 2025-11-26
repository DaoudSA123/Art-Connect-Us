import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartIcon = ({ isContactFormOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide cart icon when on cart page or when contact form is open
  if (location.pathname === '/cart' || isContactFormOpen) {
    return null;
  }

  // Don't render until mounted to ensure document.body exists
  if (!mounted) {
    return null;
  }

  const handleCartClick = () => {
    navigate('/cart');
  };

  const cartIcon = (
    <div
      className="cart-icon-wrapper"
      style={{
        position: 'fixed',
        top: isMobile ? '20px' : '28px',
        right: isMobile ? '20px' : '32px',
        zIndex: 2147483647,
        pointerEvents: 'none',
        width: isMobile ? '52px' : '60px',
        height: isMobile ? '52px' : '60px',
        margin: 0,
        padding: 0,
        left: 'auto',
        bottom: 'auto',
        overflow: 'visible'
      }}
    >
      <button
        onClick={handleCartClick}
        className="cart-icon-fixed"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 2147483647,
          backgroundColor: '#3A2E28',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(58, 46, 40, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          willChange: 'transform',
          WebkitTapHighlightColor: 'transparent',
          margin: 0,
          transform: 'translateZ(0)',
          overflow: 'visible',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4A6FA5';
          e.currentTarget.style.transform = 'translateZ(0) scale(1.08) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 111, 165, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3A2E28';
          e.currentTarget.style.transform = 'translateZ(0) scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(58, 46, 40, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)';
        }}
        aria-label="Shopping Cart"
      >
      <svg 
        style={{ 
          width: isMobile ? '22px' : '26px', 
          height: isMobile ? '22px' : '26px', 
          pointerEvents: 'none',
          strokeWidth: 2.2
        }}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.2} 
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
        />
      </svg>
      
      {/* Cart Item Count Badge */}
      {itemCount > 0 && (
        <span 
          style={{
            position: 'absolute',
            top: isMobile ? '-6px' : '-8px',
            right: isMobile ? '-4px' : '-8px',
            backgroundColor: '#ffffff',
            color: '#3A2E28',
            fontSize: isMobile ? '11px' : '12px',
            fontWeight: '700',
            borderRadius: '50%',
            height: isMobile ? '22px' : '26px',
            width: isMobile ? '22px' : '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.15)',
            minWidth: isMobile ? '22px' : '26px',
            pointerEvents: 'none',
            border: '2px solid #3A2E28',
            lineHeight: '1',
            zIndex: 1000000
          }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      </button>
    </div>
  );

  // Render to document.body using portal to ensure consistent positioning across all pages
  return createPortal(cartIcon, document.body);
};

export default CartIcon;
