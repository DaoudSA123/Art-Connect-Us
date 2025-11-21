import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartIcon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide cart icon when on cart page
  if (location.pathname === '/cart') {
    return null;
  }

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <button
      onClick={handleCartClick}
      style={{
        position: 'fixed',
        top: '24px',
        right: isMobile ? '28px' : '24px',
        zIndex: 9999,
        backgroundColor: '#4B1E1E',
        color: 'white',
        padding: '12px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        maxWidth: 'calc(100vw - 48px)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#5A2A2A';
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#4B1E1E';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
      aria-label="Shopping Cart"
    >
      <svg 
        style={{ width: '24px', height: '24px', pointerEvents: 'none' }}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
        />
      </svg>
      
      {/* Cart Item Count Badge */}
      {itemCount > 0 && (
        <span 
          style={{
            position: 'absolute',
            top: '-8px',
            right: isMobile ? '4px' : '-8px',
            backgroundColor: 'white',
            color: '#4B1E1E',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '50%',
            height: '24px',
            width: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            minWidth: '24px',
            pointerEvents: 'none'
          }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
