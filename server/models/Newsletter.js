const mongoose = require('mongoose');

// Newsletter Subscription Schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: false,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional in schema, enforced in app logic
        return /^\d{10,}$/.test(v.replace(/\D/g, '')); // At least 10 digits
      },
      message: 'Please provide a valid phone number'
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

// Index for faster lookups
// Removed email index since we're only using phone numbers now
newsletterSchema.index({ phone: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Helper function to convert phone number to E.164 format
const formatToE164 = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it already starts with +, check if it's valid E.164
  if (cleaned.startsWith('+')) {
    // Remove + and get digits
    const digits = cleaned.substring(1);
    if (digits.length >= 10) {
      return `+${digits}`;
    }
  }
  
  // Extract only digits
  const digits = cleaned.replace(/\D/g, '');
  
  if (digits.length < 10) {
    return null; // Invalid
  }
  
  // Handle US/Canada numbers (10 digits or 11 digits starting with 1)
  if (digits.length === 10) {
    // 10 digits: assume US/Canada, add +1
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // 11 digits starting with 1: US/Canada, add +
    return `+${digits}`;
  } else if (digits.length > 10) {
    // International number without country code, assume US/Canada
    // For now, we'll default to US/Canada (+1) for 10-11 digit numbers
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    // For other lengths, you might want to handle differently
    // For now, defaulting to +1 for simplicity
    return `+1${digits.slice(-10)}`; // Take last 10 digits
  }
  
  return null;
};

// Static method to subscribe phone number
newsletterSchema.statics.subscribe = async function(phone, ipAddress = '', userAgent = '') {
  try {
    // Validate that phone number is provided
    if (!phone) {
      return {
        success: false,
        message: 'Phone number is required'
      };
    }

    // Convert to E.164 format
    const phoneE164 = formatToE164(phone);
    
    if (!phoneE164) {
      return {
        success: false,
        message: 'Please provide a valid phone number (at least 10 digits)'
      };
    }

    // Use E.164 formatted phone number
    const phoneString = phoneE164;
    
    console.log('=== SUBSCRIPTION ATTEMPT ===');
    console.log('Input phone:', phone);
    console.log('E.164 formatted phone:', phoneString);
    
    // Get ALL subscriptions with phone numbers for debugging
    const allSubscriptions = await this.find({ phone: { $exists: true, $ne: null } });
    console.log('Total subscriptions in DB:', allSubscriptions.length);
    console.log('All phone numbers in DB:', allSubscriptions.map(s => ({
      id: s._id,
      phone: s.phone,
      phoneType: typeof s.phone,
      isActive: s.isActive
    })));
    
    // Try to find existing subscription with exact match
    const existingSubscription = await this.findOne({ 
      phone: phoneString
    });
    
    console.log('Query result:', existingSubscription ? {
      id: existingSubscription._id,
      storedPhone: existingSubscription.phone,
      storedPhoneType: typeof existingSubscription.phone,
      queryPhone: phoneString,
      phonesMatch: String(existingSubscription.phone) === phoneString,
      isActive: existingSubscription.isActive
    } : 'No subscription found');
    
    // Only handle if we find an exact match
    if (existingSubscription) {
      const storedPhoneStr = String(existingSubscription.phone || '');
      if (storedPhoneStr === phoneString) {
        if (existingSubscription.isActive) {
          console.log('RETURNING: Already subscribed (active)');
          return {
            success: false,
            message: 'Phone number is already subscribed',
            discountCode: existingSubscription.discountCode
          };
        } else {
          // Reactivate subscription
          console.log('Reactivating inactive subscription');
          existingSubscription.isActive = true;
          existingSubscription.subscribedAt = new Date();
          await existingSubscription.save();
          
          return {
            success: true,
            message: 'Subscription reactivated successfully',
            discountCode: existingSubscription.discountCode
          };
        }
      } else {
        console.log('WARNING: Found subscription but phones do not match!', {
          stored: storedPhoneStr,
          query: phoneString
        });
        // Continue to create new subscription
      }
    } else {
      console.log('No existing subscription found, proceeding to create new one');
    }

    // Create new subscription - ensure phone is stored as string
    // Don't include email field at all (not even null) to avoid unique index conflicts
    console.log('Creating new subscription with phone:', phoneString);
    const subscription = new this({
      phone: phoneString, // Use normalized string
      discountCode: 'ACU10',
      ipAddress,
      userAgent
    });
    
    // Explicitly unset email to avoid unique index conflicts
    subscription.email = undefined;

    try {
      await subscription.save();
      console.log('Successfully saved subscription for phone:', phoneString);
    } catch (saveError) {
      console.error('Save error:', saveError);
      if (saveError.code === 11000) {
        // Check if it's an email index error (old index issue)
        const errorMessage = saveError.message || '';
        const errorKeyPattern = saveError.keyPattern || {};
        
        if (errorMessage.includes('email') || errorKeyPattern.email) {
          // This is an email index error - the database still has the old unique email index
          // Try to find by phone to see if it actually exists
          const existingByPhone = await this.findOne({ phone: phoneString });
          if (existingByPhone && String(existingByPhone.phone) === phoneString) {
            return {
              success: false,
              message: 'Phone number is already subscribed',
              discountCode: existingByPhone.discountCode
            };
          }
          // If not found by phone, it's an email index issue - try saving without email field explicitly
          console.log('Email index error detected, retrying without email field...');
          try {
            // Delete email field from the document and try again
            delete subscription.email;
            await subscription.save();
            console.log('Successfully saved subscription after removing email field');
          } catch (retryError) {
            console.error('Retry save error:', retryError);
            return {
              success: false,
              message: 'Failed to subscribe. Please contact support.'
            };
          }
        } else {
          // Phone duplicate key error
          console.log('Duplicate key error (11000) for phone:', phoneString);
          const duplicateSubscription = await this.findOne({ phone: phoneString });
          console.log('Duplicate subscription found:', duplicateSubscription ? {
            id: duplicateSubscription._id,
            phone: duplicateSubscription.phone,
            phoneType: typeof duplicateSubscription.phone
          } : 'None found (inconsistency!)');
          
          if (duplicateSubscription && String(duplicateSubscription.phone) === phoneString) {
            return {
              success: false,
              message: 'Phone number is already subscribed',
              discountCode: duplicateSubscription.discountCode
            };
          }
          return {
            success: false,
            message: 'Phone number is already subscribed'
          };
        }
      } else {
        throw saveError;
      }
    }

    console.log('=== SUBSCRIPTION SUCCESS ===');
    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      discountCode: subscription.discountCode
    };

  } catch (error) {
    console.error('Unexpected error in subscribe:', error);
    if (error.code === 11000) {
      return {
        success: false,
        message: 'Phone number is already subscribed'
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
