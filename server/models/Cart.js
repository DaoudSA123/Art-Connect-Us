const mongoose = require('mongoose');

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true,
    maxlength: [50, 'Product ID cannot exceed 50 characters']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed $10,000']
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Allow HTTPS URLs from trusted image sources
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v) || 
               /^https?:\/\/(images\.unsplash\.com|via\.placeholder\.com|picsum\.photos)/i.test(v);
      },
      message: 'Image must be a valid HTTPS URL from a trusted source'
    }
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: {
      values: ['S', 'M', 'L', 'XL'],
      message: 'Size must be S, M, L, or XL'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10']
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Cart Schema
const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Item count cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.lastUpdated = new Date();
  next();
});

// Static method to find or create cart
cartSchema.statics.findOrCreate = async function(sessionId) {
  let cart = await this.findOne({ sessionId });
  if (!cart) {
    cart = new this({ sessionId });
    await cart.save();
  }
  return cart;
};

// Instance method to add item to cart
cartSchema.methods.addItem = function(product, size, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId === product.id && item.size === size
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    if (this.items[existingItemIndex].quantity > 10) {
      this.items[existingItemIndex].quantity = 10;
    }
  } else {
    // Add new item
    this.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      quantity: quantity,
      inStock: product.inStock
    });
  }
  
  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId, size) {
  this.items = this.items.filter(item => !(item.productId === productId && item.size === size));
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateQuantity = function(productId, size, newQuantity) {
  // Normalize productId to string for comparison
  const productIdStr = String(productId);
  const sizeStr = String(size);
  
  const item = this.items.find(item => {
    const itemProductId = String(item.productId || item.id || '');
    return itemProductId === productIdStr && String(item.size) === sizeStr;
  });
  
  if (item) {
    // Ensure quantity is between 1 and 10
    item.quantity = Math.max(1, Math.min(newQuantity, 10));
    console.log('Updated item quantity:', { productId: productIdStr, size: sizeStr, newQuantity: item.quantity });
  } else {
    console.warn('Item not found for update:', { productId: productIdStr, size: sizeStr, availableItems: this.items.map(i => ({ productId: i.productId, size: i.size })) });
  }
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
