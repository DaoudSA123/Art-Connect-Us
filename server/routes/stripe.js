const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Initialize Stripe only if key is provided
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { sessionId, successUrl, cancelUrl } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required',
        message: 'Cart session ID must be provided'
      });
    }

    // Get cart from database
    const cart = await Cart.findOne({ sessionId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        error: 'Cart is empty',
        message: 'Cannot checkout with an empty cart'
      });
    }

    // Calculate totals
    const subtotal = cart.total;
    const shipping = 10.00; // $10 CAD
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + shipping + tax;

    // Build line items for Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.name,
          description: `Size: ${item.size}`,
          images: item.image.startsWith('/') 
            ? [`${req.protocol}://${req.get('host')}${item.image}`]
            : [item.image]
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: {
          name: 'Shipping',
          description: 'Standard shipping'
        },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });

    // Add tax as a line item (if you want to show it separately)
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Tax',
            description: 'Sales tax'
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        cartSessionId: sessionId,
      },
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'], // Adjust as needed
      },
      customer_email: req.body.email || undefined, // Optional: pre-fill email
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// GET /api/stripe/session/:sessionId - Verify payment session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Try to find order in database
    const order = await Order.findOne({ stripeSessionId: sessionId });

    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email || session.customer_email,
        amount_total: session.amount_total / 100, // Convert from cents
        currency: session.currency,
      },
      order: order ? {
        id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      } : null
    });
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      message: error.message
    });
  }
});

// NOTE: Webhook route is handled directly in server/index.js
// before body parsing middleware to preserve raw body for signature verification

module.exports = router;

