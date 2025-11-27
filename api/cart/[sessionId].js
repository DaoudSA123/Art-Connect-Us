const { handleCORS } = require('../_lib/cors');
const connectDB = require('../_lib/mongodb');
const Cart = require('../_lib/models/Cart');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'GET') {
    try {
      await connectDB();
      const { sessionId } = req.query;
      
      if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 100) {
        return res.status(400).json({
          error: 'Invalid session ID',
          message: 'Session ID must be a string with maximum 100 characters'
        });
      }
      
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

