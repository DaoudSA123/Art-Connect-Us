/**
 * Klaviyo SMS Newsletter Integration Service
 * 
 * This service handles adding phone number subscribers to Klaviyo
 * using the Klaviyo Profiles API.
 */

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_API_BASE = 'https://a.klaviyo.com/api';

/**
 * Add or update a phone number subscriber in Klaviyo
 * 
 * @param {string} phone - Phone number in E.164 format (e.g., +14155552671)
 * @param {object} metadata - Additional metadata (discountCode, ipAddress, etc.)
 * @returns {Promise<{success: boolean, message: string, profileId?: string}>}
 */
async function addSMSSubscriber(phone, metadata = {}) {
  // Check if API key is configured
  if (!KLAVIYO_API_KEY) {
    console.warn('⚠️  Klaviyo API key not configured. Skipping Klaviyo integration.');
    console.warn('   Make sure KLAVIYO_API_KEY is set in your .env file');
    return {
      success: false,
      message: 'Klaviyo API key not configured'
    };
  }

  console.log(`📱 Attempting to add subscriber to Klaviyo: ${phone}`);

  try {
    // Klaviyo Profiles API endpoint
    const url = `${KLAVIYO_API_BASE}/profiles/`;
    
    // Prepare profile data
    const profileData = {
      data: {
        type: 'profile',
        attributes: {
          phone_number: phone,
          // Add custom properties if needed
          properties: {
            ...(metadata.discountCode && { discount_code: metadata.discountCode }),
            ...(metadata.subscribedAt && { subscribed_at: metadata.subscribedAt }),
            ...(metadata.source && { source: metadata.source })
          }
        }
      }
    };

    // Make API request to Klaviyo
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15' // Use latest API revision
      },
      body: JSON.stringify(profileData)
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      const textResponse = await response.text();
      console.error('❌ Failed to parse Klaviyo API response as JSON:', textResponse);
      throw new Error(`Invalid JSON response from Klaviyo: ${textResponse}`);
    }

    if (!response.ok) {
      // Check if profile already exists (409 Conflict)
      if (response.status === 409) {
        // Profile exists, try to update it instead
        console.log('ℹ️  Profile already exists in Klaviyo, attempting to update...');
        return await updateSMSSubscriber(phone, metadata);
      }
      
      console.error('❌ Klaviyo API error:', response.status, JSON.stringify(responseData, null, 2));
      return {
        success: false,
        message: `Klaviyo API error: ${responseData.detail || response.statusText}`,
        error: responseData
      };
    }

    const profileId = responseData?.data?.id;
    console.log(`✅ Successfully added subscriber to Klaviyo: ${phone} (Profile ID: ${profileId})`);
    
    return {
      success: true,
      message: 'Subscriber added to Klaviyo successfully',
      profileId: profileId
    };

  } catch (error) {
    console.error('❌ Error adding subscriber to Klaviyo:', error.message);
    console.error('   Full error:', error);
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('   Network error - check your internet connection');
    }
    return {
      success: false,
      message: `Failed to add subscriber to Klaviyo: ${error.message}`,
      error: error
    };
  }
}

/**
 * Update an existing phone number subscriber in Klaviyo
 * 
 * @param {string} phone - Phone number in E.164 format
 * @param {object} metadata - Additional metadata to update
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function updateSMSSubscriber(phone, metadata = {}) {
  if (!KLAVIYO_API_KEY) {
    return {
      success: false,
      message: 'Klaviyo API key not configured'
    };
  }

  try {
    // First, find the profile by phone number
    const searchUrl = `${KLAVIYO_API_BASE}/profiles/?filter=equals(phone_number,"${encodeURIComponent(phone)}")`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      }
    });

    if (!searchResponse.ok) {
      console.error('Error searching for profile in Klaviyo:', searchResponse.status);
      return {
        success: false,
        message: 'Failed to find profile in Klaviyo'
      };
    }

    const searchData = await searchResponse.json();
    const profiles = searchData?.data || [];
    
    if (profiles.length === 0) {
      // Profile doesn't exist, create it
      return await addSMSSubscriber(phone, metadata);
    }

    const profileId = profiles[0].id;
    
    // Update the profile
    const updateUrl = `${KLAVIYO_API_BASE}/profiles/${profileId}/`;
    const updateData = {
      data: {
        type: 'profile',
        id: profileId,
        attributes: {
          properties: {
            ...(metadata.discountCode && { discount_code: metadata.discountCode }),
            ...(metadata.subscribedAt && { subscribed_at: metadata.subscribedAt }),
            ...(metadata.source && { source: metadata.source })
          }
        }
      }
    };

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Error updating profile in Klaviyo:', updateResponse.status, errorData);
      return {
        success: false,
        message: `Failed to update profile in Klaviyo: ${errorData.detail || updateResponse.statusText}`
      };
    }

    console.log(`Successfully updated subscriber in Klaviyo: ${phone} (Profile ID: ${profileId})`);
    
    return {
      success: true,
      message: 'Subscriber updated in Klaviyo successfully',
      profileId: profileId
    };

  } catch (error) {
    console.error('Error updating subscriber in Klaviyo:', error);
    return {
      success: false,
      message: `Failed to update subscriber in Klaviyo: ${error.message}`
    };
  }
}

module.exports = {
  addSMSSubscriber,
  updateSMSSubscriber
};

