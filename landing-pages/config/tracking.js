/**
 * Google Ads Landing Page Tracking Configuration
 * 
 * This file contains all tracking functions for Google Ads landing pages.
 * It integrates with GTM, GA4, Meta Pixel, and LinkedIn Pixel for comprehensive tracking.
 */

// Initialize dataLayer for GTM
window.dataLayer = window.dataLayer || [];

/**
 * Track CTA button clicks with campaign attribution
 * @param {string} location - Where the CTA was clicked (header, hero, final_cta, etc.)
 * @param {string} campaign - Campaign identifier (core_features, use_cases, vs_competitor)
 */
function trackCTA(location, campaign) {
    // GTM/GA4 Event
    dataLayer.push({
        'event': 'cta_click',
        'event_category': 'engagement',
        'event_label': location,
        'campaign_type': campaign,
        'page_url': window.location.href,
        'timestamp': new Date().toISOString()
    });
    
    // Meta Pixel Event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: `CTA Click - ${location}`,
            content_category: campaign,
            source: 'google_ads'
        });
    }
    
    // LinkedIn Pixel Event
    if (typeof lintrk !== 'undefined') {
        lintrk('track', { conversion_id: 'YOUR_CONVERSION_ID' });
    }
    
    // Console log for debugging
    console.log('CTA Tracked:', {
        location: location,
        campaign: campaign,
        url: window.location.href
    });
}

/**
 * Track page views with campaign attribution
 */
function trackPageView() {
    // Get URL parameters for campaign attribution
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'direct';
    const utmMedium = urlParams.get('utm_medium') || 'none';
    const utmCampaign = urlParams.get('utm_campaign') || 'unknown';
    const utmContent = urlParams.get('utm_content') || 'none';
    
    // GTM/GA4 Event
    dataLayer.push({
        'event': 'landing_page_view',
        'page_title': document.title,
        'page_location': window.location.href,
        'utm_source': utmSource,
        'utm_medium': utmMedium,
        'utm_campaign': utmCampaign,
        'utm_content': utmContent,
        'timestamp': new Date().toISOString()
    });
    
    // Enhanced ecommerce for GA4
    dataLayer.push({
        'event': 'page_view',
        'page_title': document.title,
        'page_location': window.location.href,
        'content_group1': 'Landing Page',
        'content_group2': utmCampaign,
        'custom_parameter_1': utmSource,
        'custom_parameter_2': utmMedium
    });
}

/**
 * Track form interactions (if forms are present)
 * @param {string} formType - Type of form (signup, demo, contact)
 * @param {string} action - Action taken (start, complete, abandon)
 */
function trackForm(formType, action) {
    dataLayer.push({
        'event': 'form_interaction',
        'form_type': formType,
        'form_action': action,
        'page_url': window.location.href,
        'timestamp': new Date().toISOString()
    });
    
    // Meta Pixel for form events
    if (typeof fbq !== 'undefined') {
        if (action === 'start') {
            fbq('track', 'InitiateCheckout', {
                content_name: `Form Start - ${formType}`,
                source: 'google_ads'
            });
        } else if (action === 'complete') {
            fbq('track', 'CompleteRegistration', {
                content_name: `Form Complete - ${formType}`,
                source: 'google_ads'
            });
        }
    }
}

/**
 * Track scroll depth for engagement measurement
 */
function trackScrollDepth() {
    let maxScroll = 0;
    let scrollThresholds = [25, 50, 75, 90];
    let firedThresholds = [];
    
    function calculateScrollPercentage() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return Math.round((scrollTop / docHeight) * 100);
    }
    
    function handleScroll() {
        const currentScroll = calculateScrollPercentage();
        
        if (currentScroll > maxScroll) {
            maxScroll = currentScroll;
            
            scrollThresholds.forEach(threshold => {
                if (currentScroll >= threshold && !firedThresholds.includes(threshold)) {
                    firedThresholds.push(threshold);
                    
                    dataLayer.push({
                        'event': 'scroll_depth',
                        'scroll_percentage': threshold,
                        'page_url': window.location.href,
                        'timestamp': new Date().toISOString()
                    });
                }
            });
        }
    }
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(handleScroll, 100);
    });
}

/**
 * Track time on page
 */
function trackTimeOnPage() {
    const startTime = Date.now();
    let timeThresholds = [30, 60, 120, 300]; // seconds
    let firedThresholds = [];
    
    function checkTimeThresholds() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        
        timeThresholds.forEach(threshold => {
            if (timeOnPage >= threshold && !firedThresholds.includes(threshold)) {
                firedThresholds.push(threshold);
                
                dataLayer.push({
                    'event': 'time_on_page',
                    'time_threshold': threshold,
                    'page_url': window.location.href,
                    'timestamp': new Date().toISOString()
                });
            }
        });
    }
    
    // Check time thresholds every 10 seconds
    setInterval(checkTimeThresholds, 10000);
    
    // Track final time on page when user leaves
    window.addEventListener('beforeunload', function() {
        const finalTime = Math.round((Date.now() - startTime) / 1000);
        
        dataLayer.push({
            'event': 'page_exit',
            'time_on_page': finalTime,
            'page_url': window.location.href,
            'timestamp': new Date().toISOString()
        });
    });
}

/**
 * Track external link clicks (to app.superinsight.ai)
 * @param {Event} event - Click event
 */
function trackExternalLink(event) {
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && (href.includes('app.superinsight.ai') || href.includes('superinsight.ai'))) {
        dataLayer.push({
            'event': 'external_link_click',
            'link_url': href,
            'link_text': link.textContent.trim(),
            'page_url': window.location.href,
            'timestamp': new Date().toISOString()
        });
        
        // Meta Pixel for external clicks to app
        if (typeof fbq !== 'undefined' && href.includes('app.superinsight.ai')) {
            fbq('track', 'Lead', {
                content_name: 'App Redirect',
                content_category: 'external_link',
                source: 'google_ads'
            });
        }
    }
}

/**
 * Initialize all tracking on page load
 */
function initializeTracking() {
    // Track initial page view
    trackPageView();
    
    // Initialize scroll depth tracking
    trackScrollDepth();
    
    // Initialize time on page tracking
    trackTimeOnPage();
    
    // Add click tracking to all external links
    document.addEventListener('click', trackExternalLink);
    
    // Track when page becomes visible/hidden (for accurate time tracking)
    document.addEventListener('visibilitychange', function() {
        dataLayer.push({
            'event': 'visibility_change',
            'visibility_state': document.visibilityState,
            'page_url': window.location.href,
            'timestamp': new Date().toISOString()
        });
    });
    
    console.log('Landing page tracking initialized');
}

// Initialize tracking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTracking);
} else {
    initializeTracking();
}
