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
    // Primary conversion: Purchase
    PURCHASE: {
        conversionId: 'AW-17540312934',
        conversionLabel: 'f5uWCOL2juEbEObe76tB',
        value: 50.00,
        currency: 'USD'
    },
    
    // Secondary conversion: Sign up
    SIGNUP: {
        conversionId: 'AW-17540312934', 
        conversionLabel: 'lxvtCKmjj-EbEObe76tB',
        value: 25.00,
        currency: 'USD'
    },
    
    // Tertiary conversion: Demo booked
    DEMO_BOOKED: {
        conversionId: 'AW-17540312934',
        conversionLabel: 'cxSOCNqd1OAbEObe76tB',
        value: 10.00,
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
 * Track purchase conversion (primary conversion)
 * This should be called when user completes a purchase
 */
function trackPurchaseConversion(userData = {}) {
    trackGoogleAdsConversion('PURCHASE', {
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
                'value': GOOGLE_ADS_CONFIG.PURCHASE.value,
                'currency': GOOGLE_ADS_CONFIG.PURCHASE.currency,
                'items': [{
                    'item_id': 'purchase',
                    'item_name': 'Purchase',
                    'item_category': 'conversion',
                    'quantity': 1,
                    'price': GOOGLE_ADS_CONFIG.PURCHASE.value
                }]
            }
        });
    }
    
    // Meta Pixel conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: GOOGLE_ADS_CONFIG.PURCHASE.value,
            currency: GOOGLE_ADS_CONFIG.PURCHASE.currency,
            content_name: 'Purchase',
            source: 'google_ads'
        });
    }
    
    // LinkedIn conversion
    if (typeof lintrk !== 'undefined') {
        lintrk('track', { conversion_id: 'YOUR_LINKEDIN_CONVERSION_ID' });
    }
}

/**
 * Track signup conversion
 * This should be called when user signs up
 */
function trackSignupConversion(userData = {}) {
    trackGoogleAdsConversion('SIGNUP', {
        'user_id': userData.userId || null,
        'email': userData.email || null,
        'campaign_source': getCampaignSource(),
        'landing_page': window.location.href
    });
    
    // GA4 event
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'sign_up',
            'method': 'website',
            'value': GOOGLE_ADS_CONFIG.SIGNUP.value,
            'currency': GOOGLE_ADS_CONFIG.SIGNUP.currency
        });
    }
    
    // Meta Pixel conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CompleteRegistration', {
            value: GOOGLE_ADS_CONFIG.SIGNUP.value,
            currency: GOOGLE_ADS_CONFIG.SIGNUP.currency,
            content_name: 'Sign Up',
            source: 'google_ads'
        });
    }
}

/**
 * Track demo booked conversion
 */
function trackDemoBookedConversion(userData = {}) {
    trackGoogleAdsConversion('DEMO_BOOKED', {
        'user_id': userData.userId || null,
        'email': userData.email || null,
        'campaign_source': getCampaignSource(),
        'landing_page': window.location.href
    });
    
    // GA4 event
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'demo_booked',
            'value': GOOGLE_ADS_CONFIG.DEMO_BOOKED.value,
            'currency': GOOGLE_ADS_CONFIG.DEMO_BOOKED.currency
        });
    }
    
    // Meta Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Schedule', {
            value: GOOGLE_ADS_CONFIG.DEMO_BOOKED.value,
            currency: GOOGLE_ADS_CONFIG.DEMO_BOOKED.currency,
            content_name: 'Demo Booked',
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
        type: 'SIGNUP',
        timestamp: Date.now(),
        source: getCampaignSource(),
        landing_page: window.location.href
    }));
    
    // Track the signup conversion immediately
    trackSignupConversion();
    
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
        
        // Track demo bookings
        if (href && (href.includes('/demo') || href.includes('demo'))) {
            trackDemoBookedConversion();
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
    trackPurchase: trackPurchaseConversion,
    trackSignup: trackSignupConversion,
    trackDemoBooked: trackDemoBookedConversion,
    trackEnhanced: trackEnhancedConversion,
    checkPending: checkPendingConversions
};
