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

  // API base URL - use Render backend URL in production, localhost in development
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

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setCartItems(data.data.items || []);
        // Also save to localStorage as backup
        if (data.data.items) {
          localStorage.setItem(`acu-cart-${sessionId}`, JSON.stringify(data.data.items));
        }
      } else {
        // If database is unavailable, try localStorage
        if (response.status === 503 || !response.ok) {
          console.warn('Database unavailable, loading from localStorage');
          const localItems = JSON.parse(localStorage.getItem(`acu-cart-${sessionId}`) || '[]');
          setCartItems(localItems);
        } else {
          throw new Error(data.message || 'Failed to load cart');
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Try localStorage fallback
      try {
        const localItems = JSON.parse(localStorage.getItem(`acu-cart-${sessionId}`) || '[]');
        setCartItems(localItems);
      } catch (localError) {
        setError(error.message);
        setCartItems([]);
      }
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

      const data = await response.json();

      if (response.ok && data.success) {
        setCartItems(data.data.items);
        // Also save to localStorage as backup
        localStorage.setItem(`acu-cart-${sessionId}`, JSON.stringify(data.data.items));
        return true;
      } else {
        // If database is unavailable, use localStorage fallback
        if (response.status === 503 || data.error === 'Database unavailable') {
          console.warn('Database unavailable, using localStorage fallback');
          return addToCartLocalStorage(product, size, quantity);
        }
        throw new Error(data.message || data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Try localStorage fallback on any error
      try {
        return addToCartLocalStorage(product, size, quantity);
      } catch (localError) {
        setError(error.message);
        return false;
      }
    }
  };

  // LocalStorage fallback for when database is unavailable
  const addToCartLocalStorage = (product, size, quantity = 1) => {
    try {
      const storageKey = `acu-cart-${sessionId}`;
      const existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const existingItemIndex = existingItems.findIndex(
        item => item.productId === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        existingItems[existingItemIndex].quantity += quantity;
        if (existingItems[existingItemIndex].quantity > 10) {
          existingItems[existingItemIndex].quantity = 10;
        }
      } else {
        existingItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: size,
          quantity: quantity,
          inStock: product.inStock
        });
      }

      localStorage.setItem(storageKey, JSON.stringify(existingItems));
      setCartItems(existingItems);
      return true;
    } catch (error) {
      console.error('Error with localStorage fallback:', error);
      setError('Failed to add item to cart');
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

      const data = await response.json();

      if (response.ok && data.success) {
        setCartItems(data.data.items);
        localStorage.setItem(`acu-cart-${sessionId}`, JSON.stringify(data.data.items));
        return true;
      } else {
        if (response.status === 503 || data.error === 'Database unavailable') {
          return removeFromCartLocalStorage(productId, size);
        }
        throw new Error(data.message || data.error || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      try {
        return removeFromCartLocalStorage(productId, size);
      } catch (localError) {
        setError(error.message);
        return false;
      }
    }
  };

  const removeFromCartLocalStorage = (productId, size) => {
    try {
      const storageKey = `acu-cart-${sessionId}`;
      const existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedItems = existingItems.filter(
        item => !(item.productId === productId && item.size === size)
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      setCartItems(updatedItems);
      return true;
    } catch (error) {
      console.error('Error with localStorage fallback:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    try {
      setError(null);
      console.log('updateQuantity called:', { productId, size, newQuantity, currentCartItems: cartItems });
      
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

      const data = await response.json();
      console.log('Server response:', { status: response.status, data });

      if (response.ok && data.success) {
        const items = data.data?.items;
        console.log('Server returned items:', items);
        console.log('Items length:', items?.length);
        
        // If items is empty or undefined, fall back to localStorage update
        if (!items || items.length === 0) {
          console.warn('Server returned empty items array, using localStorage fallback');
          console.log('Current cart items:', cartItems);
          // Use localStorage to update instead
          return updateQuantityLocalStorage(productId, size, newQuantity);
        }
        
        console.log('Setting cart items to:', items);
        setCartItems(items);
        localStorage.setItem(`acu-cart-${sessionId}`, JSON.stringify(items));
        return true;
      } else {
        if (response.status === 503 || data.error === 'Database unavailable') {
          console.log('Database unavailable, using localStorage fallback');
          return updateQuantityLocalStorage(productId, size, newQuantity);
        }
        console.error('Server returned error:', data);
        throw new Error(data.message || data.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      try {
        console.log('Trying localStorage fallback');
        const result = updateQuantityLocalStorage(productId, size, newQuantity);
        if (!result) {
          // If localStorage update also fails, preserve current cart items
          console.warn('Both database and localStorage updates failed, preserving current cart state');
          console.log('Current cart items preserved:', cartItems);
          // Make sure we don't clear the cart
          if (cartItems.length > 0) {
            setCartItems([...cartItems]);
          }
        }
        return result;
      } catch (localError) {
        console.error('localStorage fallback also failed:', localError);
        setError(error.message);
        // Don't clear cart items on error - preserve current state
        if (cartItems.length > 0) {
          setCartItems([...cartItems]);
        }
        return false;
      }
    }
  };

  const updateQuantityLocalStorage = (productId, size, newQuantity) => {
    try {
      const storageKey = `acu-cart-${sessionId}`;
      // Use current cartItems state instead of reading from localStorage
      // This ensures we're working with the most up-to-date state
      let existingItems = [...cartItems];
      
      // If cartItems is empty, try reading from localStorage as fallback
      if (existingItems.length === 0) {
        existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
      }
      
      console.log('updateQuantityLocalStorage called:', { productId, size, newQuantity });
      console.log('Current cart items:', existingItems);
      
      // Normalize productId to string for comparison
      const productIdStr = String(productId);
      
      // Try to find item by productId (check both productId and id fields)
      const itemIndex = existingItems.findIndex(item => {
        const itemProductId = String(item.productId || item.id || '');
        const sizeMatch = String(item.size) === String(size);
        const idMatch = itemProductId === productIdStr;
        console.log('Comparing:', { 
          itemProductId, 
          productIdStr, 
          idMatch, 
          itemSize: item.size, 
          size, 
          sizeMatch,
          fullMatch: idMatch && sizeMatch
        });
        return idMatch && sizeMatch;
      });
      
      console.log('Item index found:', itemIndex);
      
      if (itemIndex !== -1) {
        // Ensure quantity is between 1 and 10
        const clampedQuantity = Math.max(1, Math.min(newQuantity, 10));
        console.log('Updating quantity from', existingItems[itemIndex].quantity, 'to', clampedQuantity);
        existingItems[itemIndex].quantity = clampedQuantity;
        
        // Create a new array to ensure React detects the change
        const updatedItems = [...existingItems];
        console.log('Updated items:', updatedItems);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        setCartItems(updatedItems);
        return true;
      } else {
        console.error('Item not found in cart:', { 
          productId, 
          productIdStr,
          size, 
          existingItems: existingItems.map(i => ({ 
            productId: i.productId, 
            id: i.id, 
            size: i.size,
            quantity: i.quantity
          }))
        });
        // CRITICAL: Don't remove items if not found - preserve current state
        console.warn('Item not found, preserving current cart items:', existingItems);
        // Make sure we keep the current items and don't clear the cart
        setCartItems([...existingItems]);
        return false;
      }
    } catch (error) {
      console.error('Error with localStorage fallback:', error);
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
