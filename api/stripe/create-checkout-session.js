const { handleCORS } = require('../_lib/cors');
const connectDB = require('../_lib/mongodb');
const Cart = require('../_lib/models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'POST') {
    try {
      await connectDB();
      const { sessionId, successUrl, cancelUrl } = JSON.parse(req.body || '{}');

      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID is required',
          message: 'Cart session ID must be provided'
        });
      }

      const cart = await Cart.findOne({ sessionId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          error: 'Cart is empty',
          message: 'Cannot checkout with an empty cart'
        });
      }

      const subtotal = cart.total;
      const shipping = 10.00;
      const tax = subtotal * 0.15;
      const total = subtotal + shipping + tax;

      const lineItems = cart.items.map(item => ({
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.name,
            description: `Size: ${item.size}`,
            images: item.image.startsWith('/') 
              ? [`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}${item.image}`]
              : [item.image]
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

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
          allowed_countries: ['CA', 'US'],
        },
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

