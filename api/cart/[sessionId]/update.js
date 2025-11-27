const { handleCORS } = require('../../_lib/cors');
const connectDB = require('../../_lib/mongodb');
const Cart = require('../../_lib/models/Cart');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'PUT') {
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
      const { productId, size, quantity } = JSON.parse(req.body || '{}');
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          error: 'Invalid session ID'
        });
      }
      
      if (!productId || !size || quantity === undefined) {
        return res.status(400).json({
          error: 'Invalid request data',
          message: 'productId, size, and quantity are required'
        });
      }
      
      const cart = await Cart.findOne({ sessionId });
      
      if (!cart) {
        return res.status(404).json({
          error: 'Cart not found',
          message: 'No cart found for this session'
        });
      }
      
      await cart.updateQuantity(productId, size, quantity);
      const updatedCart = await Cart.findOne({ sessionId });
      
      if (!updatedCart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Item quantity updated successfully',
        data: {
          sessionId: updatedCart.sessionId,
          items: updatedCart.items || [],
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

