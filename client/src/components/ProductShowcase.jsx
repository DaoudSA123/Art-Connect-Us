import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState({});
  const sectionRef = useRef(null);
  const cardRefs = useRef({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Individual scroll observers for each product card
  useEffect(() => {
    if (products.length === 0) return;

    const observers = [];

    products.forEach((product) => {
      const cardElement = cardRefs.current[product.id];
      if (!cardElement) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, product.id]));
            observer.unobserve(cardElement);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      observer.observe(cardElement);
      observers.push({ observer, element: cardElement });
    });

    return () => {
      observers.forEach(({ observer, element }) => {
        observer.unobserve(element);
      });
    };
  }, [products]);

  useEffect(() => {
    // Fallback: if IntersectionObserver is not supported, make visible immediately
    if (!window.IntersectionObserver) {
      console.log('IntersectionObserver not supported, making visible');
      setIsVisible(true);
      return;
    }

    console.log('Setting up scroll observer');
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection detected:', entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing after first trigger
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Fallback timeout: make visible after 1 second if not triggered by scroll
    const fallbackTimeout = setTimeout(() => {
      if (!isVisible) {
        console.log('Fallback timeout triggered, making visible');
        setIsVisible(true);
        observer.disconnect();
      }
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [isVisible]);

  const fetchProducts = async () => {
    // Use Render backend URL in production, localhost in development
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
      console.log('Fetching products from:', `${API_BASE}/products`);
      const response = await fetch(`${API_BASE}/products`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const text = await response.text();
        console.error('API returned non-OK status:', response.status, 'Response:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response. Content-Type:', contentType, 'Response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      
      const data = await response.json();
      console.log('Products fetched successfully:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Products data is not an array:', data);
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setProducts(data);
      // Initialize selected sizes for products with availableSizes
      const initialSizes = {};
      data.forEach(product => {
        if (product.availableSizes && product.availableSizes.length > 0) {
          initialSizes[product.id] = product.availableSizes[0];
        }
      });
      setSelectedSizes(initialSizes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('API_BASE was:', API_BASE);
      console.error('Full URL was:', `${API_BASE}/products`);
      setLoading(false);
      // Set empty products array so it doesn't show loading forever
      setProducts([]);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!product.inStock) {
      alert(`${product.name} is currently sold out. We'll notify you when it's back in stock!`);
      return;
    }

    // Use selected size if available, otherwise use product's size
    const size = selectedSizes[product.id] || product.size || '32"';
    const success = await addToCart(product, size, 1);
    if (success) {
      alert(`Added ${product.name} (Size: ${size}) to cart!`);
    } else {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleSizeSelect = (productId, size, e) => {
    e.stopPropagation();
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  if (loading) {
    return (
      <section className="py-24 px-4 bg-luxury-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-maroon mx-auto"></div>
            <p className="mt-6 text-gray-400 text-lg">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="product-showcase"
      ref={sectionRef} 
      className={`py-16 md:py-28 lg:py-32 px-4 md:px-6 lg:px-8 bg-luxury-black ${isVisible ? 'fade-in-visible' : 'fade-in-hidden'}`}
    >
      {console.log('ProductShowcase render - isVisible:', isVisible)}
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20 lg:mb-28">
          <div className="inline-block mb-4 md:mb-6 lg:mb-8">
            <span className="text-gray-300/80 text-xs md:text-sm font-mono font-medium uppercase tracking-widest">
              /// COLLECTION
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-street font-bold mb-4 md:mb-6 lg:mb-8 text-white leading-tight px-2">
           NEWEST DROP
          </h2>
          <div className="flex items-center justify-center mb-6 md:mb-8 lg:mb-10">
            <div className="w-16 md:w-20 lg:w-24 h-[1px] bg-gray-400/60"></div>
            <div className="mx-4 md:mx-5 lg:mx-6 w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-400/80 rotate-45"></div>
            <div className="w-16 md:w-20 lg:w-24 h-[1px] bg-gray-400/60"></div>
          </div>
         
        </div>

        {/* Products Grid */}
        <div className="flex justify-center items-stretch gap-6 md:gap-8 lg:gap-10">
          {Array.isArray(products) && products.length > 0 ? products.map((product, index) => (
            <div 
              key={product.id} 
              ref={(el) => {
                if (el) cardRefs.current[product.id] = el;
              }}
              className={`group bg-luxury-black rounded-lg overflow-hidden hover:shadow-xl hover:shadow-dark-maroon/30 transition-all duration-500 transform hover:-translate-y-3 border border-gray-800/80 product-card cursor-pointer flex flex-col flex-shrink-0 mx-auto md:mx-0 ${visibleCards.has(product.id) ? 'visible' : ''}`}
              style={{
                width: isMobile ? '100%' : '280px',
                maxWidth: isMobile ? '100%' : '280px'
              }}
              onClick={() => handleProductClick(product.id)}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-luxury-black flex items-center justify-center h-[280px] md:h-[300px] w-full flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-auto max-h-[280px] md:max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Sold Out Overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-denim-brown text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider rounded border border-denim-brown/50">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 md:p-6 lg:p-7 bg-luxury-black flex flex-col" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* Product Name */}
                <div style={{ 
                  minHeight: '3.5rem',
                  height: 'auto',
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'center',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <h3 className="text-sm md:text-base lg:text-lg font-street font-bold uppercase tracking-widest text-white group-hover:text-gray-300 transition-colors duration-300 leading-tight" style={{ width: '100%' }}>
                    {product.name}
                  </h3>
                </div>
                
                {/* Price */}
                <div style={{ 
                  height: '2rem',
                  minHeight: '2rem',
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <span className="text-xl md:text-2xl font-mono font-bold text-white">
                    ${product.price} CAD
                  </span>
                </div>
                
                {/* Size Display */}
                <div style={{ 
                  minHeight: '3.5rem',
                  height: 'auto',
                  marginBottom: '1rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  {!product.inStock ? (
                    <div className="text-xs md:text-sm text-gray-500/80 font-mono font-medium uppercase tracking-widest">
                      /// SOLD OUT
                    </div>
                  ) : product.availableSizes && product.availableSizes.length > 0 ? (
                    <div style={{ width: '100%' }}>
                      <span className="text-xs text-gray-400/80 font-mono font-medium uppercase tracking-widest mb-2 block">/// SIZE</span>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {product.availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={(e) => handleSizeSelect(product.id, size, e)}
                            className={`size-button px-4 py-2 text-xs md:text-sm font-street font-bold transition-all duration-300 ${
                              selectedSizes[product.id] === size
                                ? 'selected bg-denim-brown border-denim-blue text-white'
                                : 'bg-luxury-black border-gray-600/70 text-gray-300 hover:border-gray-400 hover:text-white'
                            } border-2 uppercase tracking-wider cursor-pointer`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400/70 font-mono font-medium mt-2">
                        {product.sizeGuide || 'Straight Fit'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <span className="text-xs text-gray-400/80 font-mono font-medium uppercase tracking-widest mb-2 block">/// SIZE</span>
                      <div className="text-base font-street font-bold text-white">
                        {product.size || '32"'}
                      </div>
                      <div className="text-xs text-gray-400/70 font-mono font-medium mt-1.5">
                        {product.sizeGuide || 'Straight Fit'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  className="w-full bg-dark-navy hover:bg-denim-blue text-white font-street font-bold py-3 md:py-3.5 px-4 rounded-none transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 border border-dark-navy hover:border-denim-blue uppercase tracking-widest text-xs md:text-sm shadow-md hover:shadow-lg hover:shadow-denim-blue/30 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2"
                  onClick={(e) => handleAddToCart(product, e)}
                  style={{ marginTop: 'auto', width: '100%' }}
                >
                  {!product.inStock ? '/// NOTIFY' : '/// ADD TO CART'}
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No products available at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">Please check back later.</p>
            </div>
          )}
        </div>

        {/* View All Section */}
       
      </div>
    </section>
  );
};

export default ProductShowcase;
