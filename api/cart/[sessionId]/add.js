const { handleCORS } = require('../../_lib/cors');
const connectDB = require('../../_lib/mongodb');
const Cart = require('../../_lib/models/Cart');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          error: 'Database unavailable',
          message: 'MongoDB is not connected.'
        });
      }
      
      const { sessionId } = req.query;
      const { product, size, quantity } = JSON.parse(req.body || '{}');
      
      if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
        return res.status(400).json({
          error: 'Invalid session ID',
          message: 'Session ID must be a string with maximum 100 characters'
        });
      }
      
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

