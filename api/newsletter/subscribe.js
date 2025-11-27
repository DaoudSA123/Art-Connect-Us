const { handleCORS } = require('../_lib/cors');
const connectDB = require('../_lib/mongodb');
const Newsletter = require('../_lib/models/Newsletter');

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'POST') {
    try {
      await connectDB();
      const { email } = JSON.parse(req.body || '{}');
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Email is required and must be a string'
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      
      const result = await Newsletter.subscribeEmail(email, ipAddress, userAgent);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          discountCode: result.discountCode,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(409).json({
          success: false,
          error: 'Subscription failed',
          message: result.message,
          discountCode: result.discountCode || null
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to subscribe to newsletter'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

