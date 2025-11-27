const { handleCORS } = require('../../_lib/cors');
const connectDB = require('../../_lib/mongodb');
const Order = require('../../_lib/models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (handleCORS(req, res)) return;

  if (req.method === 'GET') {
    try {
      await connectDB();
      const { sessionId } = req.query;
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const order = await Order.findOne({ stripeSessionId: sessionId });

      res.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email || session.customer_email,
          amount_total: session.amount_total / 100,
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

