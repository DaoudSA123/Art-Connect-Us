import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

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
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
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

    // For single size products, use the product's size
    const size = product.size || '32"';
    const success = await addToCart(product, size, 1);
    if (success) {
      alert(`Added ${product.name} (Size: ${size}) to cart!`);
    } else {
      alert('Failed to add item to cart. Please try again.');
    }
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
      className={`py-24 px-4 bg-luxury-black ${isVisible ? 'fade-in-visible' : 'fade-in-hidden'}`}
    >
      {console.log('ProductShowcase render - isVisible:', isVisible)}
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="text-gray-300 text-sm font-mono font-medium uppercase tracking-widest">
              /// COLLECTION
            </span>
          </div>
          <h2 className="text-6xl md:text-7xl font-street font-bold mb-6 text-white">
           NEWEST DROP
          </h2>
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-0.5 bg-gray-400"></div>
            <div className="mx-4 w-2 h-2 bg-gray-400 rotate-45"></div>
            <div className="w-16 h-0.5 bg-gray-400"></div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-street font-medium">
            FRESH DROPS. PREMIUM QUALITY. STREET READY.
          </p>
        </div>

        {/* Products Grid */}
        <div className="flex justify-center items-start gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="group bg-luxury-black rounded-lg overflow-hidden hover:shadow-xl hover:shadow-dark-maroon/30 transition-all duration-500 transform hover:-translate-y-2 border border-gray-800 hover:border-dark-maroon hover:border-opacity-60 product-card cursor-pointer flex-shrink-0"
              onClick={() => handleProductClick(product.id)}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-luxury-black flex items-center justify-center" style={{ minHeight: '280px' }}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-auto max-h-80 object-contain group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Sold Out Overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="bg-dark-maroon text-white px-4 py-2 text-sm font-bold uppercase tracking-wider rounded">
                      Sold Out
                    </span>
                  </div>
                )}
                
                {/* Quick View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-40">
                  <button 
                    className="bg-white text-luxury-black font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                  >
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 bg-luxury-black">
                {/* Product Name */}
                <h3 className="text-lg font-street font-bold uppercase tracking-widest mb-3 text-white group-hover:text-gray-300 transition-colors duration-300">
                  {product.name}
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-mono font-bold text-white">
                    ${product.price} CAD
                  </span>
                </div>
                
                {/* Size Display */}
                <div className="mb-4">
                  {!product.inStock ? (
                    <div className="text-sm text-gray-500 font-mono font-medium uppercase tracking-widest">
                      /// SOLD OUT
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-gray-400 font-mono font-medium uppercase tracking-widest mb-2 block">/// SIZE</span>
                      <div className="text-base font-street font-bold text-white">
                        {product.size || '32"'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono font-medium mt-1">
                        {product.sizeGuide || 'Straight Fit'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  className="w-full bg-dark-navy hover:bg-dark-maroon text-white font-street font-bold py-3 px-4 rounded-none transition-all duration-300 transform hover:scale-105 border border-dark-navy hover:border-dark-maroon uppercase tracking-widest text-sm"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  {!product.inStock ? '/// NOTIFY' : '/// ADD TO CART'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Section */}
       
      </div>
    </section>
  );
};

export default ProductShowcase;
