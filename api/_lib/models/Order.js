const mongoose = require('mongoose');

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
}, {
  timestamps: false
});

// Order Schema
const orderSchema = new mongoose.Schema({
  stripeSessionId: {
    type: String,
    required: [true, 'Stripe session ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    default: 'cad',
    uppercase: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postal_code: String,
    country: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

// Static method to create order from Stripe session
orderSchema.statics.createFromStripeSession = async function(stripeSession, items, shipping = 10, tax = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shipping + tax;

  const order = new this({
    stripeSessionId: stripeSession.id,
    stripePaymentIntentId: stripeSession.payment_intent,
    customerEmail: stripeSession.customer_details?.email || stripeSession.customer_email,
    items: items,
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: total,
    currency: stripeSession.currency,
    paymentStatus: stripeSession.payment_status === 'paid' ? 'paid' : 'pending',
    shippingAddress: stripeSession.shipping_details?.address ? {
      name: stripeSession.shipping_details.name,
      line1: stripeSession.shipping_details.address.line1,
      line2: stripeSession.shipping_details.address.line2,
      city: stripeSession.shipping_details.address.city,
      state: stripeSession.shipping_details.address.state,
      postal_code: stripeSession.shipping_details.address.postal_code,
      country: stripeSession.shipping_details.address.country
    } : undefined
  });

  return order.save();
};

module.exports = mongoose.model('Order', orderSchema);

