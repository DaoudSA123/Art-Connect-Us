const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const rateLimit = require('express-rate-limit');
const { addSMSSubscriber } = require('../services/klaviyo');

// Rate limiting for newsletter operations
// More lenient in development, stricter in production
const newsletterRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 requests per 15 min in prod, 100 in dev
  message: {
    error: 'Too many newsletter requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting if disabled via environment variable
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true',
});

// Apply rate limiting to all newsletter routes
router.use(newsletterRateLimit);

// Helper function to convert phone to E.164 (same as in model)
const formatToE164 = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const digits = cleaned.substring(1);
    if (digits.length >= 10) {
      return `+${digits}`;
    }
  }
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+1${digits.slice(-10)}`;
};

// Input validation middleware - phone only
const validatePhone = (req, res, next) => {
  const { phone } = req.body;
  
  // Phone number is required
  if (!phone) {
    return res.status(400).json({
      error: 'Invalid phone',
      message: 'Phone number is required'
    });
  }
  
  // Validate phone
  if (typeof phone !== 'string') {
    return res.status(400).json({
      error: 'Invalid phone',
      message: 'Phone must be a string'
    });
  }
  
  // Basic validation - E.164 format will be handled in the model
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return res.status(400).json({
      error: 'Invalid phone format',
      message: 'Please provide a valid phone number (at least 10 digits)'
    });
  }
  
  next();
};

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', validatePhone, async (req, res) => {
  try {
    const { phone } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    
    const result = await Newsletter.subscribe(phone, ipAddress, userAgent);
    
    if (result.success) {
      // Sync to Klaviyo (non-blocking - don't fail subscription if Klaviyo fails)
      // Get the E.164 formatted phone number for Klaviyo
      const phoneE164 = formatToE164(phone);
      
      if (phoneE164) {
        // Call Klaviyo asynchronously - don't wait for it or fail on error
        addSMSSubscriber(phoneE164, {
          discountCode: result.discountCode,
          subscribedAt: new Date().toISOString(),
          source: 'website_newsletter'
        })
        .then(klaviyoResult => {
          if (klaviyoResult.success) {
            console.log('✅ Klaviyo sync successful');
          } else {
            console.warn('⚠️  Klaviyo sync failed (non-blocking):', klaviyoResult.message);
          }
        })
        .catch(error => {
          // Log error but don't fail the subscription
          console.error('❌ Klaviyo integration error (non-blocking):', error.message);
        });
      } else {
        console.warn('⚠️  Could not format phone number for Klaviyo:', phone);
      }
      
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
router.post('/unsubscribe', validatePhone, async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = formatToE164(phone) || phone.replace(/\D/g, '');
    
    const subscription = await Newsletter.findOne({ 
      phone: normalizedPhone,
      isActive: true 
    });
    
    if (!subscription) {
      return res.status(404).json({
        error: 'Subscription not found',
        message: 'Phone number is not subscribed to our newsletter'
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

// GET /api/newsletter/status/:phone - Check subscription status by phone
router.get('/status/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        error: 'Invalid phone parameter',
        message: 'Phone parameter is required'
      });
    }
    
    const normalizedPhone = formatToE164(phone) || phone.replace(/\D/g, '');
    const subscription = await Newsletter.findOne({ phone: normalizedPhone });
    
    if (!subscription) {
      return res.json({
        subscribed: false,
        message: 'Phone number is not subscribed'
      });
    }
    
    res.json({
      subscribed: subscription.isActive,
      subscribedAt: subscription.subscribedAt,
      discountCode: subscription.discountCode,
      message: subscription.isActive ? 'Phone number is subscribed' : 'Phone number is unsubscribed'
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
