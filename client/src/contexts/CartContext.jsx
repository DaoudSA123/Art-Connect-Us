import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Generate a unique session ID for cart persistence
const generateSessionId = () => {
  let sessionId = localStorage.getItem('acu-session-id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('acu-session-id', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => generateSessionId());

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load cart from database on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/cart/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items || []);
      } else {
        throw new Error(data.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError(error.message);
      // Fallback to empty cart
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, size, quantity = 1) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/cart/${sessionId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            inStock: product.inStock
          },
          size,
          quantity
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items);
        return true;
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return false;
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/cart/${sessionId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          size
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items);
        return true;
      } else {
        throw new Error(data.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError(error.message);
      return false;
    }
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/cart/${sessionId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          size,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items);
        return true;
      } else {
        throw new Error(data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError(error.message);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE}/cart/${sessionId}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCartItems([]);
        return true;
      } else {
        throw new Error(data.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error.message);
      return false;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    error,
    sessionId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
