/**
 * Google Ads Conversion Tracking Configuration
 * 
 * This file handles conversion tracking for Google Ads campaigns.
 * It tracks various conversion events and sends them to Google Ads, GA4, and other platforms.
 */

/**
 * Google Ads Conversion Configuration
 * Replace these with your actual conversion IDs and labels
 */
const GOOGLE_ADS_CONFIG = {
    // Primary conversion: Trial signup
    TRIAL_SIGNUP: {
        conversionId: 'AW-XXXXXXXXX',
        conversionLabel: 'XXXXXXXXX',
        value: 50.00,
        currency: 'USD'
    },
    
    // Secondary conversion: Demo request
    DEMO_REQUEST: {
        conversionId: 'AW-XXXXXXXXX', 
        conversionLabel: 'XXXXXXXXX',
        value: 25.00,
        currency: 'USD'
    },
    
    // Micro conversion: Email signup
    EMAIL_SIGNUP: {
        conversionId: 'AW-XXXXXXXXX',
        conversionLabel: 'XXXXXXXXX', 
        value: 5.00,
        currency: 'USD'
    }
};

/**
 * Track Google Ads conversion
 * @param {string} conversionType - Type of conversion (TRIAL_SIGNUP, DEMO_REQUEST, EMAIL_SIGNUP)
 * @param {Object} additionalData - Additional conversion data
 */
function trackGoogleAdsConversion(conversionType, additionalData = {}) {
    const config = GOOGLE_ADS_CONFIG[conversionType];
    
    if (!config) {
        console.error('Unknown conversion type:', conversionType);
        return;
    }
    
    // Google Ads Global Site Tag conversion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': `${config.conversionId}/${config.conversionLabel}`,
            'value': config.value,
            'currency': config.currency,
            'transaction_id': generateTransactionId(),
            ...additionalData
        });
        
        console.log('Google Ads conversion tracked:', conversionType, config);
    } else {
        console.warn('Google Ads gtag not loaded');
    }
    
    // Also track in GTM/GA4
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'google_ads_conversion',
            'conversion_type': conversionType,
            'conversion_value': config.value,
            'conversion_currency': config.currency,
            'conversion_id': config.conversionId,
            'conversion_label': config.conversionLabel,
            'timestamp': new Date().toISOString(),
            ...additionalData
        });
    }
}

/**
 * Track trial signup conversion (primary conversion)
 * This should be called when user successfully signs up for trial
 */
function trackTrialSignupConversion(userData = {}) {
    trackGoogleAdsConversion('TRIAL_SIGNUP', {
        'user_id': userData.userId || null,
        'email': userData.email || null,
        'campaign_source': getCampaignSource(),
        'landing_page': window.location.href
    });
    
    // Enhanced ecommerce for GA4
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'purchase',
            'ecommerce': {
                'transaction_id': generateTransactionId(),
                'value': GOOGLE_ADS_CONFIG.TRIAL_SIGNUP.value,
                'currency': GOOGLE_ADS_CONFIG.TRIAL_SIGNUP.currency,
                'items': [{
                    'item_id': 'trial_signup',
                    'item_name': 'Free Trial Signup',
                    'item_category': 'conversion',
                    'quantity': 1,
                    'price': GOOGLE_ADS_CONFIG.TRIAL_SIGNUP.value
                }]
            }
        });
    }
    
    // Meta Pixel conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CompleteRegistration', {
            value: GOOGLE_ADS_CONFIG.TRIAL_SIGNUP.value,
            currency: GOOGLE_ADS_CONFIG.TRIAL_SIGNUP.currency,
            content_name: 'Trial Signup',
            source: 'google_ads'
        });
    }
    
    // LinkedIn conversion
    if (typeof lintrk !== 'undefined') {
        lintrk('track', { conversion_id: 'YOUR_LINKEDIN_CONVERSION_ID' });
    }
}

/**
 * Track demo request conversion (secondary conversion)
 */
function trackDemoRequestConversion(userData = {}) {
    trackGoogleAdsConversion('DEMO_REQUEST', {
        'user_id': userData.userId || null,
        'email': userData.email || null,
        'campaign_source': getCampaignSource(),
        'landing_page': window.location.href
    });
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: GOOGLE_ADS_CONFIG.DEMO_REQUEST.value,
            currency: GOOGLE_ADS_CONFIG.DEMO_REQUEST.currency,
            content_name: 'Demo Request',
            source: 'google_ads'
        });
    }
}

/**
 * Track email signup conversion (micro conversion)
 */
function trackEmailSignupConversion(userData = {}) {
    trackGoogleAdsConversion('EMAIL_SIGNUP', {
        'email': userData.email || null,
        'campaign_source': getCampaignSource(),
        'landing_page': window.location.href
    });
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: GOOGLE_ADS_CONFIG.EMAIL_SIGNUP.value,
            currency: GOOGLE_ADS_CONFIG.EMAIL_SIGNUP.currency,
            content_name: 'Email Signup',
            source: 'google_ads'
        });
    }
}

/**
 * Get campaign source information from URL parameters
 */
function getCampaignSource() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_medium: urlParams.get('utm_medium') || 'none', 
        utm_campaign: urlParams.get('utm_campaign') || 'unknown',
        utm_content: urlParams.get('utm_content') || 'none',
        utm_term: urlParams.get('utm_term') || 'none',
        gclid: urlParams.get('gclid') || null,
        fbclid: urlParams.get('fbclid') || null
    };
}

/**
 * Generate unique transaction ID for conversion tracking
 */
function generateTransactionId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Track conversion when redirecting to app.superinsight.ai
 * This function should be called before redirecting to the app
 */
function trackAppRedirectConversion() {
    // Set a flag to track this conversion
    sessionStorage.setItem('pending_conversion', JSON.stringify({
        type: 'TRIAL_SIGNUP',
        timestamp: Date.now(),
        source: getCampaignSource(),
        landing_page: window.location.href
    }));
    
    // Track the conversion immediately
    trackTrialSignupConversion();
    
    console.log('App redirect conversion tracked');
}

/**
 * Check for pending conversions (to be called on app.superinsight.ai)
 * This helps ensure conversions are tracked even if the redirect happens quickly
 */
function checkPendingConversions() {
    const pendingConversion = sessionStorage.getItem('pending_conversion');
    
    if (pendingConversion) {
        try {
            const conversionData = JSON.parse(pendingConversion);
            
            // Only process if conversion is recent (within 5 minutes)
            if (Date.now() - conversionData.timestamp < 300000) {
                // Track the conversion again on the app domain
                trackGoogleAdsConversion(conversionData.type, {
                    'campaign_source': conversionData.source,
                    'landing_page': conversionData.landing_page,
                    'conversion_flow': 'redirect_completion'
                });
                
                console.log('Pending conversion processed:', conversionData);
            }
            
            // Clear the pending conversion
            sessionStorage.removeItem('pending_conversion');
            
        } catch (error) {
            console.error('Error processing pending conversion:', error);
            sessionStorage.removeItem('pending_conversion');
        }
    }
}

/**
 * Enhanced conversion tracking with customer data
 * Use this when you have customer information (email, phone, etc.)
 */
function trackEnhancedConversion(conversionType, customerData) {
    const config = GOOGLE_ADS_CONFIG[conversionType];
    
    if (!config) {
        console.error('Unknown conversion type:', conversionType);
        return;
    }
    
    // Enhanced conversion data
    const enhancedData = {};
    
    if (customerData.email) {
        enhancedData.email = customerData.email;
    }
    
    if (customerData.phone) {
        enhancedData.phone_number = customerData.phone;
    }
    
    if (customerData.firstName) {
        enhancedData.first_name = customerData.firstName;
    }
    
    if (customerData.lastName) {
        enhancedData.last_name = customerData.lastName;
    }
    
    // Track with enhanced data
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': `${config.conversionId}/${config.conversionLabel}`,
            'value': config.value,
            'currency': config.currency,
            'transaction_id': generateTransactionId(),
            'user_data': enhancedData
        });
        
        console.log('Enhanced conversion tracked:', conversionType, enhancedData);
    }
}

/**
 * Initialize conversion tracking
 */
function initializeConversionTracking() {
    // Check for pending conversions on page load
    checkPendingConversions();
    
    // Add event listeners for CTA clicks that lead to conversions
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Track conversion for links to app.superinsight.ai signup
        if (href && href.includes('app.superinsight.ai/signup')) {
            trackAppRedirectConversion();
        }
        
        // Track demo requests
        if (href && (href.includes('/demo') || href.includes('demo'))) {
            trackDemoRequestConversion();
        }
    });
    
    console.log('Conversion tracking initialized');
}

// Initialize conversion tracking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConversionTracking);
} else {
    initializeConversionTracking();
}

// Export functions for external use
window.SuperinsightConversions = {
    trackTrialSignup: trackTrialSignupConversion,
    trackDemoRequest: trackDemoRequestConversion,
    trackEmailSignup: trackEmailSignupConversion,
    trackEnhanced: trackEnhancedConversion,
    checkPending: checkPendingConversions
};
