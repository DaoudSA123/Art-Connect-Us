const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection and routes
const connectDB = require('./config/connectDB');
const cartRoutes = require('./routes/cart');
const newsletterRoutes = require('./routes/newsletter');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://checkout.stripe.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "https://*.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["https://checkout.stripe.com", "https://js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalRateLimit);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? ['https://art-connect-us.vercel.app']
    : ['http://localhost:3000', 'https://art-connect-us.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else {
      // In production, only allow specified origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// IMPORTANT: Stripe webhook route must be BEFORE body parsing middleware
// This is because Stripe needs the raw body for signature verification
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook called but Stripe is not configured');
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const Cart = require('./models/Cart');
  const Order = require('./models/Order');
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful for session:', session.id);
        
        // Retrieve full session details
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items']
        });

        // Get cart items from metadata
        if (session.metadata?.cartSessionId) {
          const cart = await Cart.findOne({ sessionId: session.metadata.cartSessionId });
          
          if (cart && cart.items.length > 0) {
            // Calculate shipping and tax
            const shipping = 10.00;
            const tax = cart.total * 0.15;
            
            // Create order
            await Order.createFromStripeSession(
              fullSession,
              cart.items,
              shipping,
              tax
            );

            // Clear the cart after successful order
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
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Sample product data
const products = [
  {
    id: 1,
    name: "Levi 'FRAGILE' RAW DENIM Straight Jeans",
    price: 69.99,
    image: "/thumbnail_jeanfront.png",
    images: [
      "/thumbnail_jeanfront.png",
      "/thumbnail_jeanback.png",
      "/IMG_0153.JPG",
      "/thumbnail_IMG_0565.jpg"
    ],
    category: "Jeans",
    description: "Premium straight fit jean with classic design and modern comfort. Size 32\" waist available.",
    size: "32\"",
    sizeGuide: "Straight Fit",
    inStock: true
  },
  {
    id: 2,
    name: "Double Waist Jeans",
    price: 79.99,
    image: "/39e15cc1-5a9e-4e69-851c-9094f858ace4.png.PNG",
    images: [
      "/39e15cc1-5a9e-4e69-851c-9094f858ace4.png.PNG",
      "/38bff081-24c9-4b6e-9e8f-38d6df2e66f2.png.PNG",
      "/_DSF2283.JPG",
      "/_DSF2313.JPG"
    ],
    category: "Jeans",
    description: "Unique double waist design with premium straight fit. Available in 32\" and 36\" waist sizes.",
    size: "36\"",
    availableSizes: ["32\"", "36\""],
    sizeGuide: "Straight Fit",
    inStock: true
  }
];

// Routes
app.use('/api/cart', cartRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - Error:`, err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong!',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
