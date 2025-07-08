/**
 * Production Analytics and Event Tracking
 * Comprehensive user interaction and business metrics tracking
 */
class AnalyticsManager {
    constructor(config = {}) {
        this.config = config;
        this.isEnabled = config.FEATURES?.ENABLE_ANALYTICS || false;
        this.sessionId = this.generateSessionId();
        this.userId = this.generateUserId();
        this.events = [];
        this.maxEvents = 1000;
        this.flushInterval = 30000; // 30 seconds
        this.endpoints = {
            events: '/api/analytics/events',
            performance: '/api/analytics/performance',
            errors: '/api/analytics/errors'
        };
        
        this.initializeAnalytics();
    }
    
    /**
     * Initialize analytics tracking
     */
    initializeAnalytics() {
        if (!this.isEnabled) {
            console.log('Analytics disabled by configuration');
            return;
        }
        
        // Track page load
        this.trackEvent('page_load', {
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        });
        
        // Setup automatic event tracking
        this.setupAutoTracking();
        
        // Setup periodic flush
        this.setupPeriodicFlush();
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.flushEvents(true);
        });
        
        console.log('Analytics initialized with session:', this.sessionId);
    }
    
    /**
     * Setup automatic event tracking
     */
    setupAutoTracking() {
        // Track button clicks
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button');
            if (target) {
                this.trackEvent('button_click', {
                    buttonId: target.id,
                    buttonText: target.textContent?.trim(),
                    buttonClass: target.className,
                    x: event.clientX,
                    y: event.clientY
                });
            }
        });
        
        // Track form interactions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            this.trackEvent('form_submit', {
                formId: form.id,
                formAction: form.action,
                formMethod: form.method
            });
        });
        
        // Track navigation
        window.addEventListener('popstate', () => {
            this.trackEvent('navigation', {
                url: window.location.href,
                type: 'popstate'
            });
        });
        
        // Track scroll events (throttled)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                this.trackEvent('scroll', {
                    scrollY: window.scrollY,
                    scrollPercent: Math.min(scrollPercent, 100),
                    viewportHeight: window.innerHeight
                });
            }, 250);
        });
    }
    
    /**
     * Track custom event
     */
    trackEvent(eventName, properties = {}, options = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            id: this.generateEventId(),
            name: eventName,
            properties: {
                ...properties,
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            },
            metadata: {
                source: 'web_app',
                version: '1.0.0',
                environment: this.config.FEATURES?.DEBUG_MODE ? 'development' : 'production'
            }
        };
        
        // Add to local queue
        this.events.push(event);
        
        // Trim queue if too large
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        
        // Flush immediately for high-priority events
        if (options.immediate) {
            this.flushEvents();
        }
        
        console.log('Event tracked:', eventName, properties);
    }
    
    /**
     * Track business-specific events
     */
    trackPurchaseFlow(step, data = {}) {
        this.trackEvent('purchase_flow', {
            step,
            ...data,
            flowId: this.sessionId
        }, { immediate: true });
    }
    
    trackWalletGeneration(walletData) {
        this.trackEvent('wallet_generated', {
            walletType: walletData.type,
            addressFormat: walletData.format,
            generationMethod: walletData.method,
            walletAddress: this.hashSensitiveData(walletData.address)
        });
    }
    
    trackGeolocation(locationData) {
        this.trackEvent('geolocation_detected', {
            country: locationData.country,
            region: locationData.region,
            method: locationData.method,
            confidence: locationData.confidence,
            isSupported: locationData.isSupported
        });
    }
    
    trackAPICall(apiData) {
        this.trackEvent('api_call', {
            endpoint: apiData.endpoint,
            method: apiData.method,
            statusCode: apiData.statusCode,
            duration: apiData.duration,
            success: apiData.success
        });
    }
    
    trackError(error, context = {}) {
        this.trackEvent('error_occurred', {
            errorMessage: error.message,
            errorStack: error.stack?.substring(0, 500), // Limit stack trace
            errorType: error.constructor.name,
            context,
            severity: this.categorizeError(error)
        }, { immediate: true });
    }
    
    /**
     * Track performance metrics
     */
    trackPerformance(metrics) {
        this.trackEvent('performance_metrics', {
            loadTime: metrics.loadTime,
            firstPaint: metrics.firstPaint,
            firstContentfulPaint: metrics.firstContentfulPaint,
            largestContentfulPaint: metrics.largestContentfulPaint,
            cumulativeLayoutShift: metrics.cumulativeLayoutShift,
            memoryUsage: metrics.memoryUsage
        });
    }
    
    /**
     * Track user engagement
     */
    trackEngagement() {
        const engagement = {
            timeOnPage: Date.now() - this.pageLoadTime,
            scrollDepth: this.getMaxScrollDepth(),
            clickCount: this.getClickCount(),
            interactionCount: this.getInteractionCount()
        };
        
        this.trackEvent('user_engagement', engagement);
    }
    
    /**
     * Setup periodic event flushing
     */
    setupPeriodicFlush() {
        setInterval(() => {
            if (this.events.length > 0) {
                this.flushEvents();
            }
        }, this.flushInterval);
    }
    
    /**
     * Flush events to analytics endpoint
     */
    async flushEvents(isSync = false) {
        if (!this.isEnabled || this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        const payload = {
            sessionId: this.sessionId,
            userId: this.userId,
            events: eventsToSend,
            metadata: {
                flushTime: Date.now(),
                eventCount: eventsToSend.length,
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };
        
        try {
            if (isSync && navigator.sendBeacon) {
                // Use sendBeacon for synchronous sending on page unload
                const blob = new Blob([JSON.stringify(payload)], { 
                    type: 'application/json' 
                });
                navigator.sendBeacon(this.endpoints.events, blob);
                console.log('Events sent via sendBeacon:', eventsToSend.length);
            } else {
                // Use fetch for normal sending
                const response = await fetch(this.endpoints.events, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-ID': this.sessionId
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    console.log('Events flushed successfully:', eventsToSend.length);
                } else {
                    console.error('Failed to flush events:', response.status);
                    // Re-add events to queue for retry
                    this.events.unshift(...eventsToSend);
                }
            }
        } catch (error) {
            console.error('Error flushing events:', error);
            // Re-add events to queue for retry
            this.events.unshift(...eventsToSend);
        }
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `sess_${timestamp}_${random}`;
    }
    
    /**
     * Generate or retrieve user ID
     */
    generateUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        
        if (!userId) {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            userId = `user_${timestamp}_${random}`;
            localStorage.setItem('analytics_user_id', userId);
        }
        
        return userId;
    }
    
    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    /**
     * Hash sensitive data for privacy
     */
    hashSensitiveData(data) {
        // Simple hash for demo - in production use proper crypto
        let hash = 0;
        const str = String(data);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `hash_${Math.abs(hash).toString(36)}`;
    }
    
    /**
     * Categorize error severity
     */
    categorizeError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'warning';
        }
        
        if (message.includes('permission') || message.includes('security')) {
            return 'error';
        }
        
        if (message.includes('critical') || message.includes('fatal')) {
            return 'critical';
        }
        
        return 'info';
    }
    
    /**
     * Get maximum scroll depth
     */
    getMaxScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        return Math.round((scrollTop + windowHeight) / documentHeight * 100);
    }
    
    /**
     * Get click count from events
     */
    getClickCount() {
        return this.events.filter(event => event.name === 'button_click').length;
    }
    
    /**
     * Get total interaction count
     */
    getInteractionCount() {
        const interactionEvents = ['button_click', 'form_submit', 'scroll'];
        return this.events.filter(event => 
            interactionEvents.includes(event.name)
        ).length;
    }
    
    /**
     * Set user properties
     */
    setUserProperties(properties) {
        this.trackEvent('user_properties_updated', properties);
    }
    
    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            eventCount: this.events.length,
            isEnabled: this.isEnabled,
            lastFlush: this.lastFlushTime,
            config: this.config
        };
    }
    
    /**
     * Disable analytics
     */
    disable() {
        this.isEnabled = false;
        this.events = [];
        console.log('Analytics disabled');
    }
    
    /**
     * Enable analytics
     */
    enable() {
        this.isEnabled = true;
        console.log('Analytics enabled');
    }
}