# Phase 2: SimpleSwap Mercuryo Checkout - Production Implementation

## Model Assignments

### Claude Opus 4 (Orchestrator)
- **Role**: Production deployment coordinator and quality gate keeper
- **Responsibilities**:
  - Production-ready architecture validation
  - Security audit and approval
  - Performance optimization oversight
  - API endpoint validation and testing
  - Regional compliance verification
  - Error handling strategy finalization
  - Phase 2 → Phase 3 transition approval
  - Production deployment sign-off

### Claude Sonnet 4 (Sub-Agents)
- **Role**: Production implementation specialist
- **Responsibilities**:
  - Production-grade code generation
  - Real API integration implementation
  - Comprehensive error handling development
  - Security hardening implementation
  - Performance optimization coding
  - Cross-browser compatibility testing
  - Mobile device testing execution
  - Production monitoring setup

## Project Overview

Transform the skeleton implementation into a production-ready SimpleSwap Mercuryo checkout system with comprehensive error handling, real API integration, security hardening, performance optimization, and full regional compliance for AU/CA/USA markets.

## Core Requirements - Phase 2

### Production Requirements
- **Real API Integration**: Live SimpleSwap and Mercuryo APIs
- **Security Hardening**: Input validation, CSRF protection, secure headers
- **Performance Optimization**: Caching, lazy loading, bundle optimization
- **Comprehensive Error Handling**: User-friendly messages, retry logic, fallbacks
- **Regional Compliance**: Full AU/CA/USA validation with state-level restrictions
- **Mobile Optimization**: Touch interactions, responsive design, PWA features
- **Monitoring**: Error tracking, performance metrics, user analytics
- **Production Deployment**: Environment configuration, CI/CD ready

### Enhanced Technical Constraints
- **File size optimization**: Minified production builds
- **Security**: CSP headers, input sanitization, secure API calls
- **Performance**: < 3 second load time, < 1 second interaction response
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android 10+

## Production Architecture

### Enhanced File Structure
```
/
├── src/
│   ├── index.html              # Production-optimized HTML
│   ├── js/
│   │   ├── deepLinkBuilder.js  # Enhanced URL construction
│   │   ├── walletHandler.js    # Production wallet management
│   │   ├── geoRedirector.js    # Advanced geo-validation
│   │   ├── apiManager.js       # Real API integration
│   │   ├── securityManager.js  # Security hardening
│   │   └── performanceManager.js # Performance optimization
│   ├── css/
│   │   └── styles.css          # Optimized production styles
│   └── config/
│       ├── production.js       # Production configuration
│       └── development.js      # Development configuration
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
├── dist/                       # Production build output
├── monitoring/                 # Error tracking and analytics
└── docs/                       # Production documentation
```

## Production Implementation

### 1. Enhanced index.html (Production-Ready)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Secure cryptocurrency purchase with SimpleSwap and Mercuryo">
    <meta name="keywords" content="cryptocurrency, bitcoin, mercuryo, simpleswap, secure">
    <meta name="author" content="SimpleSwap Mercuryo Integration">
    
    <!-- Security Headers -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.simpleswap.io https://exchange.mrcr.io https://ipapi.co;">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    
    <!-- PWA Support -->
    <meta name="theme-color" content="#10b981">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Crypto Checkout">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="css/styles.css" as="style">
    <link rel="preload" href="js/config/production.js" as="script">
    
    <title>SimpleSwap Mercuryo Checkout</title>
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- Analytics (Production) -->
    <script>
        // Initialize error tracking
        window.errorTracker = [];
        window.addEventListener('error', (e) => {
            window.errorTracker.push({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: new Date().toISOString()
            });
        });
    </script>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-screen">
        <div class="spinner"></div>
        <p>Initializing secure checkout...</p>
    </div>
    
    <!-- Main Application -->
    <div id="app" class="app-container" style="display: none;">
        <div class="checkout-container">
            <!-- Header -->
            <header class="checkout-header">
                <h1>Secure Crypto Purchase</h1>
                <div class="security-badge">🔒 SSL Secured</div>
            </header>
            
            <!-- Amount Display -->
            <div class="amount-section">
                <div class="amount-display" id="amountDisplay">€19.50</div>
                <div class="amount-subtitle">Fixed Amount</div>
            </div>
            
            <!-- Payment Method -->
            <div class="payment-method-section">
                <div class="payment-method active" id="paymentMethod">
                    <span class="checkmark">✓</span>
                    <span class="provider-name">Mercuryo</span>
                    <span class="provider-badge">Recommended</span>
                </div>
            </div>
            
            <!-- Region Information -->
            <div class="region-info" id="regionInfo">
                <span class="region-icon">🌍</span>
                <span class="region-text">Detecting your location...</span>
            </div>
            
            <!-- Buy Button -->
            <button class="buy-button" id="buyButton" disabled>
                <span class="button-text">Buy Crypto</span>
                <span class="button-loader" style="display: none;">Processing...</span>
            </button>
            
            <!-- Status Messages -->
            <div class="status-messages">
                <div class="success-message" id="successMessage"></div>
                <div class="error-message" id="errorMessage"></div>
                <div class="warning-message" id="warningMessage"></div>
            </div>
            
            <!-- Footer -->
            <footer class="checkout-footer">
                <div class="powered-by">
                    Powered by <strong>SimpleSwap</strong> & <strong>Mercuryo</strong>
                </div>
                <div class="security-info">
                    <span>🔐 Bank-grade security</span>
                    <span>⚡ Instant processing</span>
                </div>
            </footer>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="js/config/production.js"></script>
    <script src="js/securityManager.js"></script>
    <script src="js/performanceManager.js"></script>
    <script src="js/apiManager.js"></script>
    <script src="js/geoRedirector.js"></script>
    <script src="js/walletHandler.js"></script>
    <script src="js/deepLinkBuilder.js"></script>
    
    <script>
        // Initialize production application
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const app = new SimpleSwapCheckoutPro();
                await app.initialize();
            } catch (error) {
                console.error('Application initialization failed:', error);
                document.getElementById('errorMessage').textContent = 
                    'Failed to initialize application. Please refresh the page.';
                document.getElementById('errorMessage').style.display = 'block';
            }
        });
    </script>
</body>
</html>
```

### 2. Production API Manager (apiManager.js)
```javascript
/**
 * Production API Manager
 * Handles all API communications with proper error handling, retries, and caching
 */
class APIManager {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.requestQueue = [];
        this.rateLimitWindow = 60000; // 1 minute
        this.maxRequestsPerWindow = 100;
        
        this.initializeRequestTracking();
    }
    
    /**
     * Initialize request tracking for rate limiting
     */
    initializeRequestTracking() {
        this.requestTimestamps = [];
        
        // Clean up old timestamps every minute
        setInterval(() => {
            const now = Date.now();
            this.requestTimestamps = this.requestTimestamps.filter(
                timestamp => now - timestamp < this.rateLimitWindow
            );
        }, this.rateLimitWindow);
    }
    
    /**
     * Check rate limit before making request
     */
    isRateLimited() {
        const now = Date.now();
        const recentRequests = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.rateLimitWindow
        );
        
        return recentRequests.length >= this.maxRequestsPerWindow;
    }
    
    /**
     * Make HTTP request with retry logic and error handling
     */
    async makeRequest(url, options = {}) {
        if (this.isRateLimited()) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        const requestId = this.generateRequestId();
        const startTime = performance.now();
        
        let lastError;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`API Request [${requestId}] Attempt ${attempt}:`, url);
                
                const response = await this.fetchWithTimeout(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-ID': requestId,
                        ...options.headers
                    }
                });
                
                // Track successful request
                this.requestTimestamps.push(Date.now());
                
                const endTime = performance.now();
                console.log(`API Request [${requestId}] Success: ${endTime - startTime}ms`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data;
                
            } catch (error) {
                lastError = error;
                console.error(`API Request [${requestId}] Attempt ${attempt} failed:`, error);
                
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw new Error(`API request failed after ${this.retryAttempts} attempts: ${lastError.message}`);
    }
    
    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = options.timeout || 10000;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }
    
    /**
     * SimpleSwap API: Get estimated exchange amount
     */
    async getEstimatedAmount(fromCurrency, toCurrency, amount) {
        const cacheKey = `estimate_${fromCurrency}_${toCurrency}_${amount}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }
        
        const url = `${this.config.URLS.SIMPLESWAP_API}/get_estimated?` +
            `api_key=${this.config.SIMPLESWAP_API_KEY}&` +
            `currency_from=${fromCurrency}&` +
            `currency_to=${toCurrency}&` +
            `amount=${amount}&` +
            `fixed=false`;
        
        try {
            const data = await this.makeRequest(url);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Failed to get estimated amount:', error);
            throw new Error('Unable to get exchange rate. Please try again.');
        }
    }
    
    /**
     * SimpleSwap API: Create exchange
     */
    async createExchange(exchangeData) {
        const url = `${this.config.URLS.SIMPLESWAP_API}/create_exchange?api_key=${this.config.SIMPLESWAP_API_KEY}`;
        
        const payload = {
            fixed: false,
            currency_from: exchangeData.fromCurrency,
            currency_to: exchangeData.toCurrency,
            amount: exchangeData.amount,
            address_to: exchangeData.walletAddress,
            user_refund_address: exchangeData.refundAddress || exchangeData.walletAddress,
            extra_id_to: exchangeData.extraId || '',
            user_refund_extra_id: exchangeData.refundExtraId || ''
        };
        
        try {
            const data = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            return data;
        } catch (error) {
            console.error('Failed to create exchange:', error);
            throw new Error('Unable to create exchange. Please try again.');
        }
    }
    
    /**
     * Mercuryo API: Get widget rates
     */
    async getMercuryoRates(currency) {
        const url = `${this.config.URLS.MERCURYO_API}/v1.6/public/rates?currency=${currency}`;
        
        try {
            const data = await this.makeRequest(url);
            return data;
        } catch (error) {
            console.error('Failed to get Mercuryo rates:', error);
            throw new Error('Unable to get payment rates. Please try again.');
        }
    }
    
    /**
     * IP Geolocation API
     */
    async getLocationByIP() {
        const cacheKey = 'user_location';
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
                return cached.data;
            }
        }
        
        try {
            const data = await this.makeRequest('https://ipapi.co/json/', {
                timeout: 5000
            });
            
            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Failed to get location:', error);
            throw new Error('Unable to detect location. Please try again.');
        }
    }
    
    /**
     * Utility methods
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}
```

### 3. Production Security Manager (securityManager.js)
```javascript
/**
 * Production Security Manager
 * Handles input validation, CSRF protection, and security hardening
 */
class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.inputValidators = new Map();
        this.securityHeaders = new Map();
        
        this.initializeValidators();
        this.initializeSecurityHeaders();
    }
    
    /**
     * Initialize input validators
     */
    initializeValidators() {
        this.inputValidators.set('amount', (value) => {
            const num = parseFloat(value);
            return !isNaN(num) && num > 0 && num <= 10000;
        });
        
        this.inputValidators.set('currency', (value) => {
            return /^[A-Z]{3}$/.test(value);
        });
        
        this.inputValidators.set('walletAddress', (value) => {
            // Basic Bitcoin address validation
            return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(value);
        });
        
        this.inputValidators.set('transactionId', (value) => {
            return /^tx_[0-9]+_[a-z0-9]{9}$/.test(value);
        });
    }
    
    /**
     * Initialize security headers
     */
    initializeSecurityHeaders() {
        this.securityHeaders.set('X-Content-Type-Options', 'nosniff');
        this.securityHeaders.set('X-Frame-Options', 'DENY');
        this.securityHeaders.set('X-XSS-Protection', '1; mode=block');
        this.securityHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Validate CSRF token
     */
    validateCSRFToken(token) {
        return token === this.csrfToken;
    }
    
    /**
     * Sanitize input string
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        return input
            .replace(/[<>\"']/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }
    
    /**
     * Validate input against specific validator
     */
    validateInput(type, value) {
        const validator = this.inputValidators.get(type);
        if (!validator) {
            console.warn(`No validator found for type: ${type}`);
            return false;
        }
        
        const sanitized = this.sanitizeInput(value);
        return validator(sanitized);
    }
    
    /**
     * Validate URL for security
     */
    validateURL(url) {
        try {
            const parsedURL = new URL(url);
            
            // Check protocol
            if (!['https:', 'http:'].includes(parsedURL.protocol)) {
                return false;
            }
            
            // Check for allowed domains
            const allowedDomains = [
                'simpleswap.io',
                'exchange.mrcr.io',
                'sandbox-exchange.mrcr.io',
                'api.simpleswap.io',
                'ipapi.co'
            ];
            
            return allowedDomains.some(domain => 
                parsedURL.hostname === domain || 
                parsedURL.hostname.endsWith(`.${domain}`)
            );
            
        } catch (error) {
            console.error('URL validation failed:', error);
            return false;
        }
    }
    
    /**
     * Encrypt sensitive data
     */
    async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            dataBuffer
        );
        
        return {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            key: await crypto.subtle.exportKey('raw', key)
        };
    }
    
    /**
     * Rate limiting check
     */
    isRateLimited(identifier, limit = 10, window = 60000) {
        const now = Date.now();
        const key = `rate_limit_${identifier}`;
        
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        attempts = attempts.filter(timestamp => now - timestamp < window);
        
        if (attempts.length >= limit) {
            return true;
        }
        
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        return false;
    }
    
    /**
     * Log security event
     */
    logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href,
            csrfToken: this.csrfToken
        };
        
        console.warn('Security Event:', logEntry);
        
        // In production, send to security monitoring service
        if (this.securityMonitoringEndpoint) {
            fetch(this.securityMonitoringEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            }).catch(error => {
                console.error('Failed to send security log:', error);
            });
        }
    }
    
    /**
     * Content Security Policy violation handler
     */
    handleCSPViolation(event) {
        this.logSecurityEvent('CSP_VIOLATION', {
            violatedDirective: event.violatedDirective,
            blockedURI: event.blockedURI,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber
        });
    }
    
    /**
     * Initialize security monitoring
     */
    initializeSecurityMonitoring() {
        // CSP violation reporting
        document.addEventListener('securitypolicyviolation', (e) => {
            this.handleCSPViolation(e);
        });
        
        // Monitor for suspicious activity
        let clickCount = 0;
        document.addEventListener('click', () => {
            clickCount++;
            if (clickCount > 100) { // Potential bot activity
                this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                    type: 'excessive_clicks',
                    count: clickCount
                });
            }
        });
        
        // Monitor for console access
        let consoleAccess = false;
        const originalLog = console.log;
        console.log = (...args) => {
            if (!consoleAccess) {
                consoleAccess = true;
                this.logSecurityEvent('CONSOLE_ACCESS', {
                    timestamp: Date.now()
                });
            }
            originalLog.apply(console, args);
        };
    }
}
```

### 4. Production Performance Manager (performanceManager.js)
```javascript
/**
 * Production Performance Manager
 * Handles performance optimization, monitoring, and resource management
 */
class PerformanceManager {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.thresholds = {
            loadTime: 3000,
            interactionTime: 1000,
            memoryUsage: 50 * 1024 * 1024, // 50MB
            bundleSize: 500 * 1024 // 500KB
        };
        
        this.initializeMonitoring();
    }
    
    /**
     * Initialize performance monitoring
     */
    initializeMonitoring() {
        // Page load performance
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });
        
        // Interaction performance
        this.setupInteractionMonitoring();
        
        // Memory usage monitoring
        this.setupMemoryMonitoring();
        
        // Network performance
        this.setupNetworkMonitoring();
    }
    
    /**
     * Measure page load performance
     */
    measurePageLoad() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
        };
        
        this.metrics.set('pageLoad', metrics);
        
        // Check thresholds
        if (metrics.totalLoadTime > this.thresholds.loadTime) {
            console.warn(`Page load time exceeded threshold: ${metrics.totalLoadTime}ms`);
        }
        
        console.log('Page Load Metrics:', metrics);
    }
    
    /**
     * Setup interaction monitoring
     */
    setupInteractionMonitoring() {
        const interactionObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > this.thresholds.interactionTime) {
                    console.warn(`Slow interaction detected: ${entry.duration}ms`);
                }
                
                this.recordMetric('interactions', {
                    type: entry.name,
                    duration: entry.duration,
                    startTime: entry.startTime,
                    timestamp: Date.now()
                });
            }
        });
        
        try {
            interactionObserver.observe({ entryTypes: ['event'] });
            this.observers.set('interaction', interactionObserver);
        } catch (error) {
            console.log('Event timing not supported');
        }
    }
    
    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const metrics = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.recordMetric('memory', metrics);
                
                if (metrics.used > this.thresholds.memoryUsage) {
                    console.warn(`Memory usage exceeded threshold: ${metrics.used / 1024 / 1024}MB`);
                }
            }, 30000); // Check every 30 seconds
        }
    }
    
    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        const networkObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('api') || entry.name.includes('exchange')) {
                    this.recordMetric('network', {
                        url: entry.name,
                        duration: entry.duration,
                        transferSize: entry.transferSize,
                        responseStart: entry.responseStart,
                        responseEnd: entry.responseEnd,
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        try {
            networkObserver.observe({ entryTypes: ['resource'] });
            this.observers.set('network', networkObserver);
        } catch (error) {
            console.log('Resource timing not supported');
        }
    }
    
    /**
     * Record performance metric
     */
    recordMetric(category, data) {
        if (!this.metrics.has(category)) {
            this.metrics.set(category, []);
        }
        
        const categoryMetrics = this.metrics.get(category);
        categoryMetrics.push(data);
        
        // Keep only last 100 entries
        if (categoryMetrics.length > 100) {
            categoryMetrics.shift();
        }
    }
    
    /**
     * Optimize images for different device types
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Lazy loading
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            } else {
                // Fallback for older browsers
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const image = entry.target;
                            image.src = image.dataset.src;
                            imageObserver.unobserve(image);
                        }
                    });
                });
                
                imageObserver.observe(img);
            }
        });
    }
    
    /**
     * Implement resource caching
     */
    implementCaching() {
        // Service worker registration for caching
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service worker registered:', registration);
            }).catch(error => {
                console.error('Service worker registration failed:', error);
            });
        }
        
        // In-memory caching for API responses
        const cache = new Map();
        const originalFetch = window.fetch;
        
        window.fetch = function(url, options = {}) {
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            
            if (options.method === 'GET' && cache.has(cacheKey)) {
                const cached = cache.get(cacheKey);
                const maxAge = 60000; // 1 minute
                
                if (Date.now() - cached.timestamp < maxAge) {
                    return Promise.resolve(cached.response.clone());
                }
            }
            
            return originalFetch(url, options).then(response => {
                if (options.method === 'GET' && response.ok) {
                    cache.set(cacheKey, {
                        response: response.clone(),
                        timestamp: Date.now()
                    });
                }
                return response;
            });
        };
    }
    
    /**
     * Optimize bundle size
     */
    optimizeBundleSize() {
        // Dynamic imports for non-critical features
        const loadAnalytics = () => {
            return import('./analytics.js').then(module => {
                return module.default;
            });
        };
        
        // Defer non-critical scripts
        const deferredScripts = document.querySelectorAll('script[defer]');
        deferredScripts.forEach(script => {
            script.addEventListener('load', () => {
                console.log(`Deferred script loaded: ${script.src}`);
            });
        });
    }
    
    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            
            this.recordMetric('coreWebVitals', {
                type: 'LCP',
                value: lcp.startTime,
                timestamp: Date.now()
            });
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
        } catch (error) {
            console.log('LCP measurement not supported');
        }
        
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            this.recordMetric('coreWebVitals', {
                type: 'CLS',
                value: clsValue,
                timestamp: Date.now()
            });
        });
        
        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        } catch (error) {
            console.log('CLS measurement not supported');
        }
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {};
        
        this.metrics.forEach((value, key) => {
            summary[key] = {
                count: value.length,
                recent: value.slice(-10) // Last 10 entries
            };
        });
        
        return summary;
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.observers.forEach((observer, key) => {
            observer.disconnect();
        });
        this.observers.clear();
        this.metrics.clear();
    }
}
```

### 5. Production Configuration (config/production.js)
```javascript
/**
 * Production Configuration
 * Environment-specific settings for production deployment
 */
const PRODUCTION_CONFIG = {
    // Environment
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    
    // API Configuration
    SIMPLESWAP_API_KEY: process.env.SIMPLESWAP_API_KEY || 'your_production_api_key',
    SIMPLESWAP_PARTNER_ID: process.env.SIMPLESWAP_PARTNER_ID || 'your_partner_id',
    
    MERCURYO_WIDGET_ID: process.env.MERCURYO_WIDGET_ID || 'your_widget_id',
    MERCURYO_SIGN_KEY: process.env.MERCURYO_SIGN_KEY || 'your_sign_key',
    
    // URLs
    URLS: {
        SIMPLESWAP_API: 'https://api.simpleswap.io',
        SIMPLESWAP_WIDGET: 'https://simpleswap.io/widget',
        MERCURYO_WIDGET: 'https://exchange.mrcr.io',
        MERCURYO_API: 'https://api.mercuryo.io',
        GEOLOCATION_API: 'https://ipapi.co/json'
    },
    
    // Application Settings
    DEFAULT_AMOUNT: '19.50',
    DEFAULT_CURRENCY_FROM: 'EUR',
    DEFAULT_CURRENCY_TO: 'BTC',
    
    // Regional Settings
    SUPPORTED_COUNTRIES: ['US', 'CA', 'AU'],
    COUNTRY_RESTRICTIONS: {
        'US': ['Hawaii', 'Louisiana', 'New York'],
        'CA': [],
        'AU': []
    },
    
    // Performance Settings
    CACHE_DURATION: 300000, // 5 minutes
    REQUEST_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Security Settings
    CSRF_TOKEN_EXPIRY: 3600000, // 1 hour
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 100,
    
    // Monitoring
    ERROR_REPORTING_ENDPOINT: process.env.ERROR_REPORTING_ENDPOINT || null,
    ANALYTICS_ENDPOINT: process.env.ANALYTICS_ENDPOINT || null,
    SECURITY_MONITORING_ENDPOINT: process.env.SECURITY_MONITORING_ENDPOINT || null,
    
    // Feature Flags
    FEATURES: {
        ANALYTICS_ENABLED: true,
        ERROR_REPORTING_ENABLED: true,
        PERFORMANCE_MONITORING_ENABLED: true,
        SECURITY_MONITORING_ENABLED: true,
        PWA_ENABLED: true
    }
};

/**
 * Production Application Class
 * Enhanced version with production-ready features
 */
class SimpleSwapCheckoutPro {
    constructor() {
        this.config = PRODUCTION_CONFIG;
        this.securityManager = new SecurityManager();
        this.performanceManager = new PerformanceManager();
        this.apiManager = new APIManager(this.config);
        this.geoRedirector = new GeoRedirectorPro();
        this.walletHandler = new WalletHandlerPro();
        this.deepLinkBuilder = new DeepLinkBuilderPro(this.config);
        
        this.isInitialized = false;
        this.initializationStartTime = performance.now();
    }
    
    /**
     * Initialize production application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Production SimpleSwap Checkout...');
            
            // Initialize security
            this.securityManager.initializeSecurityMonitoring();
            
            // Initialize performance monitoring
            this.performanceManager.implementCaching();
            this.performanceManager.optimizeImages();
            this.performanceManager.monitorCoreWebVitals();
            
            // Validate regional access
            await this.validateRegionalAccess();
            
            // Initialize wallet handler
            await this.walletHandler.initialize();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
            // Mark as initialized
            this.isInitialized = true;
            
            const initTime = performance.now() - this.initializationStartTime;
            console.log(`✅ Application initialized successfully in ${initTime}ms`);
            
            // Report successful initialization
            this.reportEvent('app_initialized', { initTime });
            
        } catch (error) {
            console.error('❌ Production initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Validate regional access with enhanced error handling
     */
    async validateRegionalAccess() {
        try {
            const validation = await this.geoRedirector.validateRegionalAccess();
            const accessResult = this.geoRedirector.handleRegionalRestriction(validation);
            
            if (!accessResult.allowed) {
                throw new Error(accessResult.message);
            }
            
            // Update UI with region information
            this.updateRegionDisplay(validation);
            
        } catch (error) {
            console.error('Regional validation failed:', error);
            throw new Error('Unable to verify regional access. Please try again.');
        }
    }
    
    /**
     * Setup enhanced event listeners
     */
    setupEventListeners() {
        const buyButton = document.getElementById('buyButton');
        
        // Enhanced buy button with loading states
        buyButton.addEventListener('click', async (e) => {
            await this.handleBuyClick(e);
        });
        
        // Handle online/offline states
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
    }
    
    /**
     * Enhanced buy button handler
     */
    async handleBuyClick(event) {
        event.preventDefault();
        
        if (!this.isInitialized) {
            this.showError('Application not ready. Please wait.');
            return;
        }
        
        const button = event.target;
        const startTime = performance.now();
        
        try {
            // Security checks
            if (this.securityManager.isRateLimited('buy_click', 5, 60000)) {
                throw new Error('Too many attempts. Please wait before trying again.');
            }
            
            // Update button state
            this.updateButtonState(button, 'loading');
            
            // Generate wallet address
            const walletAddress = await this.walletHandler.generateAddress();
            
            // Copy to clipboard
            await this.walletHandler.copyToClipboard(walletAddress);
            
            // Create exchange
            const exchange = await this.apiManager.createExchange({
                fromCurrency: this.config.DEFAULT_CURRENCY_FROM,
                toCurrency: this.config.DEFAULT_CURRENCY_TO,
                amount: this.config.DEFAULT_AMOUNT,
                walletAddress: walletAddress
            });
            
            // Build deep link
            const deepLinkURL = this.deepLinkBuilder.buildProductionURL(exchange);
            
            // Open deep link
            const opened = this.deepLinkBuilder.openURL(deepLinkURL);
            
            if (!opened) {
                throw new Error('Failed to open payment page');
            }
            
            // Success feedback
            this.showSuccess('Wallet address copied! Opening payment page...');
            
            // Report successful purchase initiation
            const duration = performance.now() - startTime;
            this.reportEvent('purchase_initiated', { duration, exchangeId: exchange.id });
            
        } catch (error) {
            console.error('Buy process failed:', error);
            this.showError(error.message || 'Purchase failed. Please try again.');
            this.reportEvent('purchase_failed', { error: error.message });
        } finally {
            this.updateButtonState(button, 'ready');
        }
    }
    
    /**
     * Update button state with enhanced UI
     */
    updateButtonState(button, state) {
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        
        switch (state) {
            case 'loading':
                button.disabled = true;
                buttonText.style.display = 'none';
                buttonLoader.style.display = 'inline';
                button.classList.add('loading');
                break;
            case 'ready':
                button.disabled = false;
                buttonText.style.display = 'inline';
                buttonLoader.style.display = 'none';
                button.classList.remove('loading');
                break;
        }
    }
    
    /**
     * Enhanced error handling
     */
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 10000);
        
        // Report error
        this.reportEvent('error_displayed', { message });
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
        
        // Report success
        this.reportEvent('success_displayed', { message });
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            app.style.display = 'block';
            app.style.opacity = '1';
            document.getElementById('buyButton').disabled = false;
        }, 500);
    }
    
    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.innerHTML = `
            <div class="error-container">
                <h2>🚨 Initialization Failed</h2>
                <p>Unable to start the application. Please refresh the page.</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
        
        this.reportEvent('initialization_failed', { error: error.message });
    }
    
    /**
     * Update region display
     */
    updateRegionDisplay(validation) {
        const regionInfo = document.getElementById('regionInfo');
        const regionText = regionInfo.querySelector('.region-text');
        
        regionText.textContent = `Available in ${validation.country}`;
        regionInfo.style.display = 'block';
    }
    
    /**
     * Handle online/offline status
     */
    handleOnlineStatus(isOnline) {
        const statusMessage = isOnline ? 'Connection restored' : 'Connection lost';
        const messageType = isOnline ? 'success' : 'warning';
        
        this[`show${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`](statusMessage);
        
        this.reportEvent('connection_status', { isOnline });
    }
    
    /**
     * Handle page visibility
     */
    handlePageHidden() {
        // Pause non-essential operations
        this.performanceManager.observers.forEach(observer => {
            if (observer.disconnect) observer.disconnect();
        });
    }
    
    handlePageVisible() {
        // Resume operations
        this.performanceManager.initializeMonitoring();
    }
    
    /**
     * Report events to analytics
     */
    reportEvent(eventName, data = {}) {
        if (!this.config.FEATURES.ANALYTICS_ENABLED) return;
        
        const event = {
            name: eventName,
            data,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        if (this.config.ANALYTICS_ENDPOINT) {
            fetch(this.config.ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            }).catch(error => {
                console.error('Analytics reporting failed:', error);
            });
        }
        
        console.log('📊 Event:', event);
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.performanceManager.cleanup();
        this.apiManager.clearCache();
    }
}

// Initialize error reporting
window.addEventListener('error', (event) => {
    if (window.app && window.app.reportEvent) {
        window.app.reportEvent('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// Initialize unhandled promise rejection reporting
window.addEventListener('unhandledrejection', (event) => {
    if (window.app && window.app.reportEvent) {
        window.app.reportEvent('unhandled_promise_rejection', {
            reason: event.reason.toString()
        });
    }
});
```

## Production Validation Gates

### Phase 2 Validation Commands
```bash
# Security audit
npm audit --audit-level high

# Performance testing
lighthouse https://your-domain.com --output json --chrome-flags="--headless"

# Code quality
eslint src/ --ext .js
jshint src/js/

# Cross-browser testing
# Manual testing required on:
# - Chrome 90+ (desktop/mobile)
# - Firefox 88+ (desktop/mobile)
# - Safari 14+ (desktop/mobile)
# - Edge 90+ (desktop/mobile)

# Mobile device testing
# Physical device testing required:
# - iPhone 12+ (iOS 14+)
# - Samsung Galaxy S21+ (Android 10+)
# - iPad Pro (latest)

# Load testing
artillery quick --count 100 --num 10 https://your-domain.com

# Security testing
# Manual security audit required:
# - OWASP Top 10 compliance
# - CSP header validation
# - XSS protection testing
# - CSRF protection testing
```

### Success Criteria - Phase 2
- [ ] Real API integration functional
- [ ] Page load time < 3 seconds
- [ ] Interaction response < 1 second
- [ ] Error handling comprehensive
- [ ] Security audit passed
- [ ] Cross-browser compatibility verified
- [ ] Mobile optimization complete
- [ ] Regional compliance validated
- [ ] Performance monitoring active
- [ ] Production deployment ready

## Implementation Tasks (Sequential Order)

### Sonnet 4 Production Tasks
1. **Security Hardening** (45 min)
   - Implement SecurityManager class
   - Add input validation and sanitization
   - Set up CSRF protection
   - Configure CSP headers

2. **Performance Optimization** (40 min)
   - Implement PerformanceManager class
   - Add caching strategies
   - Optimize bundle size
   - Monitor Core Web Vitals

3. **Real API Integration** (60 min)
   - Implement APIManager class
   - Add retry logic and error handling
   - Implement rate limiting
   - Add request/response validation

4. **Enhanced UI/UX** (35 min)
   - Implement loading states
   - Add success/error messaging
   - Enhance mobile interactions
   - Add accessibility features

5. **Production Configuration** (25 min)
   - Set up environment variables
   - Configure production settings
   - Add feature flags
   - Set up monitoring endpoints

6. **Testing & Validation** (60 min)
   - Cross-browser testing
   - Mobile device testing
   - Performance testing
   - Security testing

### Opus 4 Production Tasks
1. **Security Audit** (30 min)
   - Review security implementation
   - Validate OWASP compliance
   - Approve security measures
   - Sign off on security standards

2. **Performance Review** (25 min)
   - Validate performance metrics
   - Review optimization strategies
   - Approve performance standards
   - Sign off on Core Web Vitals

3. **Production Deployment** (20 min)
   - Review deployment readiness
   - Validate environment configuration
   - Approve production release
   - Sign off for Phase 3 transition

## Production Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Monitoring endpoints active
- [ ] Error reporting configured
- [ ] Analytics tracking enabled

### Post-Deployment
- [ ] Health check endpoints responding
- [ ] Performance monitoring active
- [ ] Error rates within acceptable limits
- [ ] User experience validated
- [ ] Security monitoring active
- [ ] Backup systems functional

## PRP Quality Score

**Confidence Level: 9/10**

### Strengths
- Comprehensive security implementation
- Production-grade performance optimization
- Real API integration with error handling
- Cross-browser and mobile compatibility
- Monitoring and analytics integration
- Environment-specific configuration

### Areas for Monitoring
- Real-world performance under load
- Security vulnerability scanning
- User experience feedback
- Regional compliance validation
- API rate limiting effectiveness

This Phase 2 PRP provides a production-ready implementation with enterprise-level security, performance, and monitoring capabilities.