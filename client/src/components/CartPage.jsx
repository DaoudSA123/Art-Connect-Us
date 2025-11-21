import React from 'react';
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

  const handleCheckout = () => {
    // TODO: Integrate with Stripe
    alert('Checkout functionality will be integrated with Stripe soon!');
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
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-maroon mx-auto mb-4"></div>
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
            className="bg-dark-maroon hover:bg-dark-maroon/90 text-white font-street font-bold py-2 px-4 rounded-none transition-all duration-300"
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
              backgroundColor: '#4B1E1E',
              borderColor: '#4B1E1E'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3A1616';
              e.currentTarget.style.borderColor = '#3A1616';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4B1E1E';
              e.currentTarget.style.borderColor = '#4B1E1E';
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
      <div className="bg-dark-navy py-8 md:py-12 px-4 sticky top-0 z-40 border-b-2 border-gray-600 relative">
        {/* Mobile: Back button at left edge of screen */}
        <button
          onClick={handleBackToProducts}
          className="md:hidden absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white p-2 rounded-full transition-all duration-300 shadow-md border border-gray-600/40 flex items-center justify-center z-50"
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
          <div className="hidden md:grid grid-cols-3 items-center">
            <button
              onClick={handleBackToProducts}
              className="text-white hover:text-gray-300 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-lg md:text-xl justify-self-start"
            >
              ← Back to Collection
            </button>
            <h1 className="text-2xl md:text-3xl font-street font-bold uppercase tracking-widest text-center">
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
            <button
              onClick={handleClearCart}
              className="text-gray-400 hover:text-white transition-colors duration-300 font-street font-bold uppercase tracking-widest text-sm justify-self-end"
            >
              Clear All
            </button>
          </div>
          {/* Mobile: Centered title */}
          <div className="md:hidden text-center">
            <h1 className="text-xl font-street font-bold uppercase tracking-widest">
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={`${item.productId || item.id}-${item.size}`} className="bg-luxury-black border border-gray-800 p-6 hover:border-dark-maroon/50 transition-colors duration-300">
                    <div className="flex items-center space-x-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-luxury-black border border-gray-700 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-street font-bold uppercase tracking-widest text-white mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 font-street text-sm uppercase tracking-widest mb-2">
                          Size: {item.size}
                        </p>
                        <p className="text-2xl font-mono font-bold text-white">
                          ${item.price} CAD
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-600">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                handleUpdateQuantity(item.productId || item.id, item.size, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 bg-transparent hover:bg-dark-maroon text-gray-300 hover:text-white transition-colors duration-300 font-street font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span className="w-12 h-10 bg-luxury-black text-white font-street font-bold flex items-center justify-center border-x border-gray-600">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity < 10) {
                                console.log('Cart item before update:', item);
                                console.log('Updating with:', { 
                                  productId: item.productId || item.id, 
                                  size: item.size, 
                                  newQuantity: item.quantity + 1 
                                });
                                handleUpdateQuantity(item.productId || item.id, item.size, item.quantity + 1);
                              }
                            }}
                            disabled={item.quantity >= 10}
                            className="w-10 h-10 bg-transparent hover:bg-dark-maroon text-gray-300 hover:text-white transition-colors duration-300 font-street font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId || item.id, item.size)}
                          className="text-gray-500 hover:text-red-400 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-luxury-black border border-gray-800 p-6 sticky top-32">
                <h2 className="text-2xl font-street font-bold uppercase tracking-widest mb-6 text-white">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-street">Subtotal</span>
                    <span className="text-white font-mono font-bold">${subtotal.toFixed(2)} CAD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-street">Shipping</span>
                    <span className="text-white font-mono font-bold">
                      {shipping > 0 ? `$${shipping.toFixed(2)} CAD` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-street">Tax</span>
                    <span className="text-white font-mono font-bold">${tax.toFixed(2)} CAD</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-street font-bold uppercase tracking-widest text-white">Total</span>
                      <span className="text-2xl font-mono font-bold text-white">${total.toFixed(2)} CAD</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="text-white font-street font-bold py-4 px-6 rounded-none transition-all duration-300 transform hover:scale-105 border uppercase tracking-widest text-lg mb-4"
                  style={{
                    backgroundColor: '#4B1E1E',
                    borderColor: '#4B1E1E'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3A1616';
                    e.currentTarget.style.borderColor = '#3A1616';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4B1E1E';
                    e.currentTarget.style.borderColor = '#4B1E1E';
                  }}
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500 font-street text-center">
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
