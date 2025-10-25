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
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        // If specific product not found, fetch all and find by ID
        const allResponse = await fetch('http://localhost:5000/api/products');
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
    if (!selectedSize && product.inStock) {
      alert('Please select a size');
      return;
    }
    
    if (quantity > 10) {
      alert('Maximum quantity is 10');
      return;
    }
    
    const success = await addToCart(product, selectedSize, quantity);
    if (success) {
      alert(`Added ${product.name} (Size: ${selectedSize}, Qty: ${quantity}) to cart!`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dark-maroon mx-auto"></div>
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
            className="bg-dark-navy hover:bg-dark-maroon text-white font-street font-bold py-3 px-6 rounded-none transition-all duration-300 uppercase tracking-widest"
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
      <div className="bg-dark-navy py-12 px-4 sticky top-0 z-50 border-b-2 border-dark-maroon">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBackToProducts}
            className="text-dark-maroon hover:text-white transition-colors duration-300 font-street font-bold uppercase tracking-widest text-lg md:text-xl"
          >
            ← Back to Collection
          </button>
          <h1 className="text-2xl md:text-3xl font-street font-bold uppercase tracking-widest">
            Product Details
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-none border border-gray-800 bg-gray-900">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-80 md:h-96 lg:h-[500px] object-cover"
                style={{ 
                  objectPosition: 'center 25%',
                  transform: 'translateY(30px)'
                }}
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="bg-dark-maroon text-white px-6 py-3 text-lg font-bold uppercase tracking-wider rounded">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            
            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-800 rounded-none border border-gray-700 hover:border-dark-maroon transition-colors duration-300 cursor-pointer"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:space-y-8">
            <div>
              <span className="text-dark-maroon text-sm font-mono font-medium uppercase tracking-widest">
                /// {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-street font-bold text-white mt-2 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center mb-6">
                <div className="w-16 h-0.5 bg-dark-maroon"></div>
                <div className="mx-4 w-2 h-2 bg-dark-maroon rotate-45"></div>
                <div className="w-16 h-0.5 bg-dark-maroon"></div>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl md:text-3xl font-mono font-bold text-white mb-6">
              ${product.price}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-street font-bold text-white uppercase tracking-widest">
                /// Description
              </h3>
              <p className="text-gray-300 text-base md:text-lg font-street font-medium leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.inStock && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-street font-bold text-white uppercase tracking-widest">
                    /// Size
                  </h3>
                  {selectedSize && (
                    <span className="text-sm text-dark-maroon font-mono font-medium">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`size-button w-16 h-16 transition-all duration-300 text-base font-street font-bold rounded-none flex items-center justify-center flex-shrink-0 min-w-0 ${
                        selectedSize === size 
                          ? 'selected shadow-lg shadow-dark-maroon/30' 
                          : 'border-gray-500 hover:border-dark-maroon text-gray-300 hover:text-white hover:shadow-md hover:shadow-dark-maroon/20'
                      }`}
                      style={{ minWidth: '64px', minHeight: '64px' }}
                    >
                      <span className="text-center font-bold">{size}</span>
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-sm text-gray-500 font-mono font-medium">
                    Please select a size
                  </p>
                )}
                <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-none">
                  <h4 className="text-sm font-street font-bold text-white uppercase tracking-widest mb-2">
                    /// Size Guide
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
                    <div>S: Chest 36-38"</div>
                    <div>M: Chest 38-40"</div>
                    <div>L: Chest 40-42"</div>
                    <div>XL: Chest 42-44"</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.inStock && (
              <div className="space-y-4">
                <h3 className="text-lg font-street font-bold text-white uppercase tracking-widest">
                  /// Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="size-button w-12 h-12 hover:border-dark-maroon text-gray-300 hover:text-white flex items-center justify-center font-street font-bold transition-all duration-300 hover:bg-dark-maroon hover:shadow-md hover:shadow-dark-maroon/20 disabled:opacity-50 disabled:cursor-not-allowed border-gray-500"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="w-16 h-12 border-2 border-gray-500 flex items-center justify-center bg-luxury-black">
                    <span className="text-xl font-mono font-bold text-white">
                      {quantity}
                    </span>
                  </div>
                  <button 
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="size-button w-12 h-12 hover:border-dark-maroon text-gray-300 hover:text-white flex items-center justify-center font-street font-bold transition-all duration-300 hover:bg-dark-maroon hover:shadow-md hover:shadow-dark-maroon/20 disabled:opacity-50 disabled:cursor-not-allowed border-gray-500"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 font-mono font-medium">
                  Max quantity: 10
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4 space-y-3">
              {!product.inStock ? (
                <button className="w-full bg-gray-600 text-gray-400 font-street font-bold py-4 px-6 rounded-none uppercase tracking-widest text-lg cursor-not-allowed">
                  /// Sold Out
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`w-full font-street font-bold py-4 px-6 rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-widest text-lg border-2 ${
                      selectedSize 
                        ? 'bg-dark-navy hover:bg-dark-maroon text-white border-dark-navy hover:border-dark-maroon shadow-lg hover:shadow-xl hover:shadow-dark-maroon/30' 
                        : 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {selectedSize ? '/// Add to Cart' : '/// Select Size First'}
                  </button>
                  {selectedSize && (
                    <p className="text-sm text-gray-400 font-mono font-medium text-center">
                      Ready to add {quantity} × {product.name} (Size: {selectedSize}) to cart
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-street font-bold text-white uppercase tracking-widest">
                /// Details
              </h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-street font-bold">Category:</span> {product.category}</p>
                <p><span className="font-street font-bold">Availability:</span> {product.inStock ? 'In Stock' : 'Sold Out'}</p>
                <p><span className="font-street font-bold">SKU:</span> {product.id}</p>
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

export default ProductPage;
