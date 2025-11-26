# Stripe Integration Setup Guide

## Prerequisites

1. **Install Dependencies**

   ```bash
   # Server
   cd server
   npm install stripe

   # Client (optional - only if using Stripe Elements)
   cd client
   npm install @stripe/stripe-js
   ```

2. **Get Stripe API Keys**

   - Sign up for a Stripe account at https://stripe.com
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

3. **Set Up Environment Variables**

   Add these to your `server/.env` file:

   ```env
   STRIPE_SECRET_KEY=sk_test_...your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret_here
   CLIENT_URL=http://localhost:3000
   ```

   **Note:** For production, use `sk_live_` and `pk_live_` keys instead.

4. **Set Up Webhooks (Production)**

   - In Stripe Dashboard, go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret and add it to your `.env` file

5. **Testing with Stripe Test Cards**

   Use these test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires Authentication:** `4000 0025 0000 3155`

   Use any future expiry date (e.g., 12/34) and any 3-digit CVC.

## How It Works

1. **Checkout Flow:**
   - User clicks "Proceed to Checkout" in cart
   - Server creates a Stripe Checkout Session
   - User is redirected to Stripe's hosted checkout page
   - After payment, user is redirected to `/checkout/success`

2. **Order Processing:**
   - When payment succeeds, Stripe sends a webhook
   - Server creates an Order record in MongoDB
   - Cart is automatically cleared
   - Order details are stored for future reference

3. **Order Model:**
   - Orders are stored in the `Order` collection
   - Includes customer email, items, totals, shipping address
   - Tracks payment status and order status

## API Endpoints

- `POST /api/stripe/create-checkout-session` - Create checkout session
- `GET /api/stripe/session/:sessionId` - Verify payment session
- `POST /api/stripe/webhook` - Handle Stripe webhooks (internal)

## Files Created/Modified

- `server/models/Order.js` - Order model for tracking purchases
- `server/routes/stripe.js` - Stripe API routes
- `server/index.js` - Updated to include Stripe routes and CSP
- `client/src/components/CartPage.jsx` - Updated checkout handler
- `client/src/components/CheckoutSuccess.jsx` - Success page component
- `client/src/App.jsx` - Added checkout success route

## Testing Locally

1. Start your server: `cd server && npm start`
2. Start your client: `cd client && npm start`
3. Add items to cart
4. Click "Proceed to Checkout"
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Verify order was created in MongoDB

## Production Checklist

- [ ] Switch to live Stripe API keys
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Update `CLIENT_URL` in `.env` to production URL
- [ ] Test webhook delivery
- [ ] Set up email notifications for orders
- [ ] Configure inventory management
- [ ] Set up order fulfillment workflow

