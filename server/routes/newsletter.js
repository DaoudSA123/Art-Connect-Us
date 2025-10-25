const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const rateLimit = require('express-rate-limit');

// Rate limiting for newsletter operations
const newsletterRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 newsletter requests per windowMs
  message: {
    error: 'Too many newsletter requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all newsletter routes
router.use(newsletterRateLimit);

// Input validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Email is required and must be a string'
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }
  
  next();
};

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    
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
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
router.post('/unsubscribe', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscription = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    if (!subscription) {
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'Email is not subscribed to our newsletter'
      });
    }
    
    const result = await subscription.unsubscribe();
    
    res.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to unsubscribe from newsletter'
    });
  }
});

// GET /api/newsletter/status/:email - Check subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid email parameter',
        message: 'Email parameter is required'
      });
    }
    
    const subscription = await Newsletter.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!subscription) {
      return res.json({
        subscribed: false,
        message: 'Email is not subscribed'
      });
    }
    
    res.json({
      subscribed: subscription.isActive,
      subscribedAt: subscription.subscribedAt,
      discountCode: subscription.discountCode,
      message: subscription.isActive ? 'Email is subscribed' : 'Email is unsubscribed'
    });
    
  } catch (error) {
    console.error('Newsletter status check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check subscription status'
    });
  }
});

// GET /api/newsletter/stats - Get newsletter statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // In a real app, you'd add authentication here
    const totalSubscriptions = await Newsletter.countDocuments();
    const activeSubscriptions = await Newsletter.countDocuments({ isActive: true });
    const recentSubscriptions = await Newsletter.countDocuments({
      subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    res.json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        recentSubscriptions,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve newsletter statistics'
    });
  }
});

module.exports = router;
