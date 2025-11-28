import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer.jsx';
import { useCart } from '../contexts/CartContext';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      // Initialize selected size when product loads
      if (product.availableSizes && product.availableSizes.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      } else {
        setSelectedSize(product.size || '32"');
      }
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        // If specific product not found, fetch all and find by ID
        const allResponse = await fetch(`${API_BASE}/products`);
        const allProducts = await allResponse.json();
        const foundProduct = allProducts.find(p => p.id === parseInt(id));
        setProduct(foundProduct);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Use selectedSize if available, otherwise fall back to product.size
    const size = selectedSize || product.size || '32"';
    
    if (!size) {
      alert('Please select a size');
      return;
    }
    
    if (quantity > 10) {
      alert('Maximum quantity is 10');
      return;
    }
    
    const success = await addToCart(product, size, quantity);
    if (success) {
      alert(`Added ${product.name} (Size: ${size}, Qty: ${quantity}) to cart!`);
    } else {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleBackToProducts = () => {
    navigate('/');
    // Scroll to product showcase section after navigation
    setTimeout(() => {
      const productSection = document.getElementById('product-showcase');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (product && product.images && product.images.length > 1) {
      if (isLeftSwipe) {
        // Swipe left - next image
        setSelectedImageIndex((prev) => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      } else if (isRightSwipe) {
        // Swipe right - previous image
        setSelectedImageIndex((prev) => 
          prev === 0 ? product.images.length - 1 : prev - 1
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-denim-brown mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-street font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
          <button 
            onClick={handleBackToProducts}
            className="bg-dark-navy hover:bg-denim-blue text-white font-street font-bold py-3 px-6 rounded-none transition-all duration-300 uppercase tracking-widest"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Header */}
      <div className="bg-dark-navy py-5 md:py-8 px-4 sticky top-0 z-40 border-b-2 border-gray-600 relative">
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
          {/* Desktop: Flex layout with back button */}
          <div className="hidden md:flex items-center justify-between">
            <button 
              onClick={handleBackToProducts}
              className="text-white hover:text-gray-300 transition-colors duration-300 font-street font-bold uppercase tracking-widest text-lg md:text-xl"
            >
              ← Back to Collection
            </button>
            <h1 className="text-2xl md:text-3xl font-street font-bold uppercase tracking-widest">
              Product Details
            </h1>
            <div className="w-24"></div>
          </div>
          {/* Mobile: Centered title */}
          <div className="md:hidden text-center">
            <h1 className="text-xl font-street font-bold uppercase tracking-widest">
              Product Details
            </h1>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-6 md:px-8 pb-16 md:pb-10 mb-12 md:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-3">
            <div 
              className="relative overflow-hidden rounded-none border-2 border-gray-700/80 bg-gray-900/50 flex items-center justify-center backdrop-blur-sm"
              style={{ minHeight: '800px', height: '860px' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img 
                src={product.images ? product.images[selectedImageIndex] : product.image} 
                alt={product.name}
                className={`w-full h-[800px] object-contain ${
                  product.name === "Double Waist Jeans" && selectedImageIndex === 1
                    ? ""
                    : ""
                }`}
                style={
                  product.name === "Double Waist Jeans" && selectedImageIndex === 1
                    ? { transform: "scale(1.3)", transformOrigin: "2.5% center" }
                    : {}
                }
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-denim-brown text-white px-7 py-3.5 text-lg font-bold uppercase tracking-wider rounded border border-denim-brown/50 shadow-lg">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {(product.images || [product.image]).slice(0, 4).map((img, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`rounded-none border-2 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center bg-gray-900/50 backdrop-blur-sm ${
                    selectedImageIndex === i 
                      ? 'border-denim-blue ring-2 ring-denim-blue ring-opacity-50 scale-105 shadow-lg' 
                      : 'border-gray-600/70 hover:border-denim-blue/70 hover:scale-102'
                  }`}
                  style={{ minHeight: '110px' }}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full h-auto max-h-24 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-gray-300/80 text-xs md:text-sm font-mono font-medium uppercase tracking-widest">
                /// {product.category}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-street font-bold text-white mt-2 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center">
                <div className="w-20 md:w-24 h-[1px] bg-gray-400/60"></div>
                <div className="mx-5 md:mx-6 w-2.5 h-2.5 bg-gray-400/80 rotate-45"></div>
                <div className="w-20 md:w-24 h-[1px] bg-gray-400/60"></div>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl md:text-3xl font-mono font-bold text-white">
              ${product.price} CAD
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-street font-bold text-white uppercase tracking-widest">
                /// Description
              </h3>
              <p className="text-gray-200/90 text-sm md:text-base font-street font-medium leading-snug">
                {product.description}
              </p>
            </div>

            {/* Size Display */}
            {product.inStock && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm md:text-base font-street font-bold text-white uppercase tracking-widest mb-4">
                    /// Size
                  </h3>
                  {product.availableSizes && product.availableSizes.length > 0 ? (
                    <div 
                      className="flex flex-row flex-wrap" 
                      style={{ 
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '16px'
                      }}
                    >
                      {product.availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSize(size);
                          }}
                          className={`size-button font-street font-bold transition-all duration-300 ${
                            selectedSize === size
                              ? 'selected bg-denim-brown border-denim-blue text-white shadow-md'
                              : 'bg-luxury-black border-gray-600/70 text-gray-300 hover:border-gray-400 hover:text-white'
                          } border-2 uppercase tracking-wider cursor-pointer`}
                          style={{ 
                            padding: '12px 24px',
                            fontSize: '16px',
                            minWidth: '90px',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xl md:text-2xl text-white font-street font-bold">
                      {product.size || '32"'}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-900/60 backdrop-blur-sm border-2 border-gray-600/70 rounded-none">
                  <h4 className="text-xs md:text-sm font-street font-bold text-white uppercase tracking-widest mb-2">
                    /// Size Guide
                  </h4>
                  <div className="text-xs md:text-sm text-gray-200/90 font-street font-medium">
                    {product.sizeGuide || 'Straight Fit'}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.inStock && (
              <div className="space-y-3">
                <h3 className="text-sm md:text-base font-street font-bold text-white uppercase tracking-widest text-center">
                  /// Quantity
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="size-button w-12 h-12 hover:border-gray-300 text-white hover:text-white flex items-center justify-center font-street font-bold transition-all duration-300 hover:bg-gray-700/80 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border-gray-400/70"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="w-24 h-12 border-2 border-gray-400/70 flex items-center justify-center bg-luxury-black backdrop-blur-sm">
                    <span className="text-xl font-mono font-bold text-white">
                      {quantity}
                    </span>
                  </div>
                  <button 
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="size-button w-12 h-12 hover:border-gray-300 text-white hover:text-white flex items-center justify-center font-street font-bold transition-all duration-300 hover:bg-gray-700/80 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border-gray-400/70"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mb-12 md:mb-0">
              {!product.inStock ? (
                <button className="w-full bg-gray-600/50 text-gray-400 font-street font-bold py-3 md:py-4 px-6 rounded-none uppercase tracking-widest text-sm md:text-base cursor-not-allowed border-2 border-gray-600/50">
                  /// Sold Out
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="w-full font-street font-bold py-3 md:py-4 px-6 rounded-none transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 uppercase tracking-widest text-sm md:text-base border-2 bg-dark-navy hover:bg-denim-blue text-white border-dark-navy hover:border-denim-blue shadow-lg hover:shadow-xl hover:shadow-denim-blue/30 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2 focus:ring-offset-luxury-black"
                >
                  /// Add to Cart
                </button>
              )}
            </div>

            {/* Product Details */}
        
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductPage;
