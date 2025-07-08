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