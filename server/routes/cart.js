const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const rateLimit = require('express-rate-limit');

// Rate limiting for cart operations
const cartRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many cart requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all cart routes
router.use(cartRateLimit);

// Input validation middleware
const validateCartInput = (req, res, next) => {
  const { sessionId } = req.params;
  
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
    return res.status(400).json({
      error: 'Invalid session ID',
      message: 'Session ID must be a string with maximum 100 characters'
    });
  }
  
  next();
};

// Validate product data
const validateProductData = (req, res, next) => {
  const { product, size, quantity } = req.body;
  
  if (!product || !product.id || !product.name || !product.price || !product.image) {
    return res.status(400).json({
      error: 'Invalid product data',
      message: 'Product must have id, name, price, and image'
    });
  }
  
  if (!size || typeof size !== 'string' || size.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid size',
      message: 'Size must be a non-empty string'
    });
  }
  
  if (!quantity || quantity < 1 || quantity > 10) {
    return res.status(400).json({
      error: 'Invalid quantity',
      message: 'Quantity must be between 1 and 10'
    });
  }
  
  next();
};

// GET /api/cart/:sessionId - Get cart by session ID
router.get('/:sessionId', validateCartInput, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          sessionId,
          items: [],
          total: 0,
          itemCount: 0
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
        lastUpdated: cart.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch cart'
    });
  }
});

// POST /api/cart/:sessionId/add - Add item to cart
router.post('/:sessionId/add', validateCartInput, validateProductData, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.'
      });
    }
    
    const { sessionId } = req.params;
    const { product, size, quantity } = req.body;
    
    const cart = await Cart.findOrCreate(sessionId);
    await cart.addItem(product, size, quantity);
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount
      }
    });
    
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/:sessionId/update - Update item quantity
router.put('/:sessionId/update', validateCartInput, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.'
      });
    }
    
    const { sessionId } = req.params;
    const { productId, size, quantity } = req.body;
    
    console.log('Update quantity request:', { sessionId, productId, size, quantity });
    
    if (!productId || !size || quantity === undefined) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'productId, size, and quantity are required'
      });
    }
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      console.log('Cart not found for session:', sessionId);
      return res.status(404).json({
        error: 'Cart not found',
        message: 'No cart found for this session'
      });
    }
    
    console.log('Cart found with', cart.items.length, 'items');
    console.log('Cart items:', cart.items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })));
    
    await cart.updateQuantity(productId, size, quantity);
    
    // Reload cart to ensure we have the latest data
    const updatedCart = await Cart.findOne({ sessionId });
    
    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
        message: 'Cart was not found after update'
      });
    }
    
    // Ensure we have items
    const items = updatedCart.items || [];
    
    console.log('Cart update - returning items:', items.length, 'items');
    console.log('Updated items:', items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })));
    
    res.json({
      success: true,
      message: 'Item quantity updated successfully',
      data: {
        sessionId: updatedCart.sessionId,
        items: items,
        total: updatedCart.total || 0,
        itemCount: updatedCart.itemCount || 0
      }
    });
    
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update cart'
    });
  }
});

// DELETE /api/cart/:sessionId/remove - Remove item from cart
router.delete('/:sessionId/remove', validateCartInput, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.'
      });
    }
    
    const { sessionId } = req.params;
    const { productId, size } = req.body;
    
    if (!productId || !size) {
      return res.status(400).json({
        error: 'Invalid request data',
        message: 'productId and size are required'
      });
    }
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
        message: 'No cart found for this session'
      });
    }
    
    await cart.removeItem(productId, size);
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount
      }
    });
    
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart/:sessionId/clear - Clear entire cart
router.delete('/:sessionId/clear', validateCartInput, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable',
        message: 'MongoDB is not connected. Please check your database connection.'
      });
    }
    
    const { sessionId } = req.params;
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
        message: 'No cart found for this session'
      });
    }
    
    await cart.clearCart();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        sessionId: cart.sessionId,
        items: [],
        total: 0,
        itemCount: 0
      }
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;
