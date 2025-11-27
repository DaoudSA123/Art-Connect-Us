const connectDB = require('../_lib/mongodb');
const Cart = require('../_lib/models/Cart');
const Order = require('../_lib/models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Webhook doesn't need CORS - it's called by Stripe
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const sig = req.headers['stripe-signature'];
    // Vercel provides raw body - it might be in req.body (Buffer) or req.rawBody
    const rawBody = req.rawBody || req.body;
    
    // Ensure it's a Buffer for Stripe
    const bodyBuffer = Buffer.isBuffer(rawBody) 
      ? rawBody 
      : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        bodyBuffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Payment successful for session:', session.id);
          
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items']
          });

          if (session.metadata?.cartSessionId) {
            const cart = await Cart.findOne({ sessionId: session.metadata.cartSessionId });
            
            if (cart && cart.items.length > 0) {
              const shipping = 10.00;
              const tax = cart.total * 0.15;
              
              await Order.createFromStripeSession(
                fullSession,
                cart.items,
                shipping,
                tax
              );

              await cart.clearCart();
              console.log('Order created and cart cleared for session:', session.metadata.cartSessionId);
            }
          }
          break;

        case 'payment_intent.succeeded':
          console.log('PaymentIntent succeeded:', event.data.object.id);
          const paymentIntent = event.data.object;
          if (paymentIntent.metadata?.orderId) {
            await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
              paymentStatus: 'paid'
            });
          }
          break;

        case 'payment_intent.payment_failed':
          console.log('PaymentIntent failed:', event.data.object.id);
          const failedPayment = event.data.object;
          if (failedPayment.metadata?.orderId) {
            await Order.findByIdAndUpdate(failedPayment.metadata.orderId, {
              paymentStatus: 'failed'
            });
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

