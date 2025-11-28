import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Footer from './Footer.jsx';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    loading,
    error,
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal 
  } = useCart();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackToProducts = () => {
    navigate('/');
    // Scroll to product showcase section
    setTimeout(() => {
      const productSection = document.getElementById('product-showcase');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCheckout = async () => {
    try {
      // Get sessionId from localStorage (same one used in CartContext)
      const sessionId = localStorage.getItem('acu-session-id');
      
      if (!sessionId) {
        alert('Unable to process checkout. Please try again.');
        return;
      }

      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.message || 'Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    }
  };

  const handleRemoveItem = async (productId, size) => {
    const success = await removeFromCart(productId, size);
    if (!success) {
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const handleUpdateQuantity = async (productId, size, newQuantity) => {
    console.log('Updating quantity:', { productId, size, newQuantity });
    const success = await updateQuantity(productId, size, newQuantity);
    if (!success) {
      console.error('Failed to update quantity');
      alert('Failed to update quantity. Please try again.');
    } else {
      console.log('Quantity updated successfully');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const success = await clearCart();
      if (!success) {
        alert('Failed to clear cart. Please try again.');
      }
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 10 : 0; // $10 shipping
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-denim-brown mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg font-street">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-street font-bold text-red-400 mb-4">Error Loading Cart</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-denim-blue hover:bg-denim-blue/90 text-white font-street font-bold py-2 px-4 rounded-none transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-luxury-black text-white">
        {/* Header */}
        <div className="bg-dark-navy py-8 md:py-12 px-4 sticky top-0 z-40 border-b-2 border-gray-600">
        <div className="max-w-7xl mx-auto">
          {/* Desktop: Grid layout with back button */}
          <div className="hidden md:grid grid-cols-3 items-center">
            <button
              onClick={handleBackToProducts}
              className="text-white hover:text-gray-300 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-lg md:text-xl justify-self-start"
            >
              ← Back to Collection
            </button>
            <h1 className="text-2xl md:text-3xl font-street font-bold uppercase tracking-widest text-center">
              Shopping Cart
            </h1>
            <div></div>
          </div>
          {/* Mobile: Centered title only, no buttons */}
          <div className="md:hidden text-center">
            <h1 className="text-xl font-street font-bold uppercase tracking-widest">
              Shopping Cart
            </h1>
          </div>
        </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <svg className="w-24 h-24 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-4xl font-street font-bold uppercase tracking-widest mb-6 text-white">
            Your Cart is Empty
          </h2>
          <p className="text-gray-400 text-lg mb-8 font-street">
            Discover our latest collection and add some items to your cart.
          </p>
          <button
            onClick={handleBackToProducts}
            className="text-white font-street font-bold py-4 px-8 rounded-none transition-all duration-300 transform hover:scale-105 border uppercase tracking-widest text-lg"
            style={{
              backgroundColor: '#4A6FA5',
              borderColor: '#4A6FA5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5B7FB8';
              e.currentTarget.style.borderColor = '#5B7FB8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4A6FA5';
              e.currentTarget.style.borderColor = '#4A6FA5';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #4A6FA5';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-luxury-black text-white flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-dark-navy pt-5 md:pt-8 pb-3 md:pb-5 pl-12 pr-4 md:px-4 sticky top-0 z-40 border-b-2 border-gray-600 relative">
        {/* Mobile: Back button at left edge of screen */}
        <button
          onClick={handleBackToProducts}
          className="md:hidden absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white p-2 rounded-full transition-all duration-300 shadow-md border border-gray-600/40 flex items-center justify-center z-50"
          style={{
            width: '36px',
            height: '36px'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="max-w-7xl mx-auto">
          {/* Desktop: Grid layout with back button */}
          <div className="hidden md:grid grid-cols-3 items-center gap-4">
            <button
              onClick={handleBackToProducts}
              className="text-white hover:text-gray-300 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-base md:text-lg justify-self-start"
            >
              ← Back to Collection
            </button>
            <h1 className="text-xl md:text-2xl font-street font-bold uppercase tracking-widest text-center">
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
            <button
              onClick={handleClearCart}
              className="text-gray-400 hover:text-red-400 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-xs md:text-sm justify-self-end"
            >
              Clear All
            </button>
          </div>
          {/* Mobile: Centered title */}
          <div className="md:hidden text-center px-10">
            <h1 className="text-lg font-street font-bold uppercase tracking-widest">
              Cart ({cartItems.length})
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="-mt-2 md:-mt-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-0 pb-4 md:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-2 md:space-y-3">
                {cartItems.map((item) => (
                  <div key={`${item.productId || item.id}-${item.size}`} className="bg-luxury-black border border-gray-800/80 p-3 md:p-4 hover:border-denim-blue/60 transition-all duration-300 hover:shadow-lg hover:shadow-denim-blue/10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                      {/* Product Image */}
                      <div className="w-20 md:w-20 md:h-20 bg-luxury-black border border-gray-700/70 overflow-hidden flex-shrink-0 rounded-none aspect-square">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 w-full md:w-auto">
                        <h3 className="text-sm md:text-base font-street font-bold uppercase tracking-widest text-white mb-1.5 leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between md:justify-start gap-3">
                          <p className="text-gray-400/80 font-street text-xs md:text-sm uppercase tracking-widest">
                            Size: {item.size}
                          </p>
                          <p className="text-base md:text-lg font-mono font-bold text-white">
                            ${item.price} CAD
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls and Trash Icon */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                        <div className="flex items-center border border-gray-600/70">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                handleUpdateQuantity(item.productId || item.id, item.size, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 md:w-9 md:h-9 bg-transparent hover:bg-denim-blue/80 text-gray-300 hover:text-white transition-all duration-300 font-street font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-1 text-sm"
                          >
                            −
                          </button>
                          <span className="w-10 md:w-12 h-8 md:h-9 bg-luxury-black text-white font-street font-bold flex items-center justify-center border-x border-gray-600/70 text-xs md:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity < 10) {
                                handleUpdateQuantity(item.productId || item.id, item.size, item.quantity + 1);
                              }
                            }}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 md:w-9 md:h-9 bg-transparent hover:bg-denim-blue/80 text-gray-300 hover:text-white transition-all duration-300 font-street font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-1 text-sm"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Trash Can Icon */}
                        <button
                          onClick={() => handleRemoveItem(item.productId || item.id, item.size)}
                          className="p-2 hover:bg-denim-blue/20 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2 flex-shrink-0"
                          aria-label="Remove item from cart"
                          type="button"
                        >
                          <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none"
                          >
                            <path 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                              stroke="#4A6FA5" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-luxury-black border border-gray-800/80 p-5 md:p-6 lg:sticky lg:top-24 backdrop-blur-sm">
                <h2 className="text-lg md:text-xl font-street font-bold uppercase tracking-widest mb-5 md:mb-6 text-white">
                  Order Summary
                </h2>

                <div className="space-y-3 md:space-y-4 mb-5 md:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400/90 font-street text-sm md:text-base">Subtotal</span>
                    <span className="text-white font-mono font-bold text-base md:text-lg">${subtotal.toFixed(2)} CAD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400/90 font-street text-sm md:text-base">Shipping</span>
                    <span className="text-white font-mono font-bold text-base md:text-lg">
                      {shipping > 0 ? `$${shipping.toFixed(2)} CAD` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400/90 font-street text-sm md:text-base">Tax</span>
                    <span className="text-white font-mono font-bold text-base md:text-lg">${tax.toFixed(2)} CAD</span>
                  </div>
                  <div className="border-t border-gray-700/70 pt-4 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-street font-bold uppercase tracking-widest text-white">Total</span>
                      <span className="text-xl md:text-2xl font-mono font-bold text-white">${total.toFixed(2)} CAD</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full text-white font-street font-bold py-3 md:py-4 px-6 rounded-none transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 border uppercase tracking-widest text-sm md:text-base mb-3 shadow-lg hover:shadow-xl hover:shadow-denim-blue/30 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2"
                  style={{
                    backgroundColor: '#4A6FA5',
                    borderColor: '#4A6FA5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5B7FB8';
                    e.currentTarget.style.borderColor = '#5B7FB8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A6FA5';
                    e.currentTarget.style.borderColor = '#4A6FA5';
                  }}
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500/70 font-street text-center">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CartPage;
