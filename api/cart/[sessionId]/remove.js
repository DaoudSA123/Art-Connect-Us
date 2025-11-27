const { handleCORS } = require('../../_lib/cors');
const connectDB = require('../../_lib/mongodb');
const Cart = require('../../_lib/models/Cart');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'DELETE') {
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
      const { productId, size } = JSON.parse(req.body || '{}');
      
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          error: 'Invalid session ID'
        });
      }
      
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

