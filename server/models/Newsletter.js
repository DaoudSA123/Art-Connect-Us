const mongoose = require('mongoose');

// Newsletter Subscription Schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  discountCode: {
    type: String,
    default: 'ACU10',
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster email lookups
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Static method to subscribe email
newsletterSchema.statics.subscribeEmail = async function(email, ipAddress = '', userAgent = '') {
  try {
    // Check if email already exists
    const existingSubscription = await this.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return {
          success: false,
          message: 'Email is already subscribed',
          discountCode: existingSubscription.discountCode
        };
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        
        return {
          success: true,
          message: 'Email reactivated successfully',
          discountCode: existingSubscription.discountCode
        };
      }
    }

    // Create new subscription
    const subscription = new this({
      email: email.toLowerCase(),
      discountCode: 'ACU10',
      ipAddress,
      userAgent
    });

    await subscription.save();

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      discountCode: subscription.discountCode
    };

  } catch (error) {
    if (error.code === 11000) {
      return {
        success: false,
        message: 'Email is already subscribed'
      };
    }
    throw error;
  }
};

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = async function() {
  this.isActive = false;
  await this.save();
  return {
    success: true,
    message: 'Successfully unsubscribed from newsletter'
  };
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
