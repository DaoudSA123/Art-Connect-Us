# Vercel Serverless Deployment Guide

This project has been converted to use Vercel serverless functions. Everything (frontend + backend) can now be deployed on Vercel.

## Project Structure

```
/
├── api/                    # Serverless functions
│   ├── _lib/              # Shared utilities
│   │   ├── mongodb.js     # MongoDB connection (cached)
│   │   ├── cors.js        # CORS handling
│   │   ├── products.js    # Product data
│   │   └── models/        # Mongoose models
│   ├── cart/              # Cart endpoints
│   ├── stripe/             # Stripe endpoints
│   ├── newsletter/         # Newsletter endpoints
│   ├── products.js         # Products endpoint
│   └── health.js           # Health check
├── client/                 # React frontend
├── server/                 # Original Express server (kept for reference)
└── vercel.json            # Vercel configuration
```

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret

### Optional:
- `CORS_ORIGIN` - Frontend URL (defaults to localhost for dev)
- `CLIENT_URL` - Frontend URL for Stripe redirects
- `NODE_ENV` - Set to `production` (auto-set by Vercel)

## Deployment Steps

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Convert to Vercel serverless functions"
   git push
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Add environment variables
   - Deploy!

3. **Configure Stripe Webhook**:
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret
   - Add to Vercel as `STRIPE_WEBHOOK_SECRET`

## API Endpoints

All endpoints are under `/api/`:

- `GET /api/health` - Health check
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/cart/[sessionId]` - Get cart
- `POST /api/cart/[sessionId]/add` - Add item to cart
- `PUT /api/cart/[sessionId]/update` - Update item quantity
- `DELETE /api/cart/[sessionId]/remove` - Remove item
- `DELETE /api/cart/[sessionId]/clear` - Clear cart
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `GET /api/stripe/session/[sessionId]` - Get Stripe session
- `POST /api/stripe/webhook` - Stripe webhook (called by Stripe)
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

## Local Development

For local development, you can still use the Express server:

```bash
cd server
npm install
npm run dev
```

Or test serverless functions locally with Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Notes

- MongoDB connection is cached across function invocations for performance
- CORS is automatically handled
- Frontend uses relative paths (`/api/...`) in production
- All serverless functions are in the `api/` folder
- Models are copied to `api/_lib/models/` for easy access

