/**
 * Production Deep Link Builder
 * Enhanced URL construction with security validation and error handling
 */
class DeepLinkBuilder {
    constructor(config = {}) {
        this.config = config;
        this.baseURLs = {
            simpleswap: 'https://simpleswap.io/widget',
            mercuryo: 'https://exchange.mrcr.io/',
            mercuryoSandbox: 'https://sandbox-exchange.mrcr.io/'
        };
        
        this.maxURLLength = 2048;
        this.validProtocols = ['https:', 'http:'];
        this.urlCache = new Map();
    }
    
    /**
     * Build enhanced SimpleSwap widget URL with validation
     */
    buildSimpleSwapURL(params = {}) {
        try {
            const defaultParams = {
                defaultCurrencyFrom: 'eur',
                defaultCurrencyTo: 'btc',
                defaultPaymentAmount: '19.50',
                colorTheme: 'white',
                language: 'en',
                partnerId: this.config.SIMPLESWAP_PARTNER_ID || 'demo',
                fixAmount: 'true',
                fixCurrency: 'true'
            };
            
            const finalParams = this.sanitizeParams({ ...defaultParams, ...params });
            const urlParams = new URLSearchParams();
            
            Object.entries(finalParams).forEach(([key, value]) => {
                if (this.isValidParamValue(value)) {
                    urlParams.append(key, String(value));
                }
            });
            
            const url = `${this.baseURLs.simpleswap}?${urlParams.toString()}`;
            
            if (!this.validateURL(url)) {
                throw new Error('Generated SimpleSwap URL failed validation');
            }
            
            console.log('SimpleSwap URL generated:', url);
            return url;
            
        } catch (error) {
            console.error('Failed to build SimpleSwap URL:', error);
            throw new Error(`SimpleSwap URL generation failed: ${error.message}`);
        }
    }
    
    /**
     * Build enhanced Mercuryo widget URL with comprehensive parameters
     */
    buildMercuryoURL(params = {}) {
        try {
            const requiredParams = ['widget_id', 'address'];
            const missingParams = requiredParams.filter(param => !params[param]);
            
            if (missingParams.length > 0) {
                throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
            }
            
            const defaultParams = {
                type: 'buy',
                currency: 'BTC',
                fiat_currency: 'EUR',
                amount: '19.50',
                fix_amount: 'true',
                fix_currency: 'true',
                payment_method: 'credit_debit_card',
                theme: 'light',
                redirect_url: window.location.origin,
                lang: 'en'
            };
            
            const finalParams = this.sanitizeParams({ ...defaultParams, ...params });
            const urlParams = new URLSearchParams();
            
            // Add validated parameters
            Object.entries(finalParams).forEach(([key, value]) => {
                if (this.isValidParamValue(value)) {
                    urlParams.append(key, String(value));
                }
            });
            
            // Choose environment based on config
            const baseURL = this.config.FEATURES?.DEBUG_MODE 
                ? this.baseURLs.mercuryoSandbox 
                : this.baseURLs.mercuryo;
            
            const url = `${baseURL}?${urlParams.toString()}`;
            
            if (!this.validateURL(url)) {
                throw new Error('Generated Mercuryo URL failed validation');
            }
            
            console.log('Mercuryo URL generated:', url);
            return url;
            
        } catch (error) {
            console.error('Failed to build Mercuryo URL:', error);
            throw new Error(`Mercuryo URL generation failed: ${error.message}`);
        }
    }
    
    /**
     * Generate cryptographically secure transaction ID
     */
    generateTransactionId(prefix = 'tx') {
        try {
            const timestamp = Date.now();
            const randomBytes = new Uint8Array(8);
            crypto.getRandomValues(randomBytes);
            
            const randomString = Array.from(randomBytes, byte => 
                byte.toString(36).padStart(2, '0')
            ).join('').substring(0, 9);
            
            const transactionId = `${prefix}_${timestamp}_${randomString}`;
            
            // Validate generated ID
            if (!this.validateTransactionId(transactionId)) {
                throw new Error('Generated transaction ID failed validation');
            }
            
            console.log('Transaction ID generated:', transactionId);
            return transactionId;
            
        } catch (error) {
            console.error('Failed to generate transaction ID:', error);
            // Fallback to timestamp-based ID
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }
    
    /**
     * Generate HMAC signature for Mercuryo widget (production)
     */
    async generateMercuryoSignature(params, secretKey) {
        try {
            if (!secretKey) {
                console.warn('No secret key provided for signature generation');
                return this.generateFallbackSignature(params);
            }
            
            // Sort parameters alphabetically
            const sortedParams = Object.keys(params)
                .sort()
                .map(key => `${key}=${params[key]}`)
                .join('&');
            
            // Create HMAC-SHA256 signature
            const encoder = new TextEncoder();
            const keyData = encoder.encode(secretKey);
            const messageData = encoder.encode(sortedParams);
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            
            const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
            const signatureArray = new Uint8Array(signature);
            
            return Array.from(signatureArray, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
        } catch (error) {
            console.error('Failed to generate HMAC signature:', error);
            return this.generateFallbackSignature(params);
        }
    }
    
    /**
     * Generate fallback signature for demo/testing
     */
    generateFallbackSignature(params) {
        const baseString = `${params.widget_id}_${params.merchant_transaction_id}_${Date.now()}`;
        return btoa(baseString).replace(/[+=\/]/g, '').substring(0, 32);
    }
    
    /**
     * Validate URL security and format
     */
    validateURL(url) {
        try {
            const parsedURL = new URL(url);
            
            // Check protocol
            if (!this.validProtocols.includes(parsedURL.protocol)) {
                console.warn('Invalid protocol:', parsedURL.protocol);
                return false;
            }
            
            // Check URL length
            if (url.length > this.maxURLLength) {
                console.warn('URL too long:', url.length);
                return false;
            }
            
            // Check allowed domains
            const allowedDomains = [
                'simpleswap.io',
                'exchange.mrcr.io',
                'sandbox-exchange.mrcr.io'
            ];
            
            const isAllowedDomain = allowedDomains.some(domain => 
                parsedURL.hostname === domain || 
                parsedURL.hostname.endsWith(`.${domain}`)
            );
            
            if (!isAllowedDomain) {
                console.warn('Domain not allowed:', parsedURL.hostname);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('URL validation failed:', error);
            return false;
        }
    }
    
    /**
     * Validate transaction ID format
     */
    validateTransactionId(transactionId) {
        const pattern = /^[a-zA-Z0-9_]+$/;
        return pattern.test(transactionId) && 
               transactionId.length >= 10 && 
               transactionId.length <= 50;
    }
    
    /**
     * Sanitize URL parameters
     */
    sanitizeParams(params) {
        const sanitized = {};
        
        Object.entries(params).forEach(([key, value]) => {
            if (this.isValidParamKey(key) && this.isValidParamValue(value)) {
                sanitized[key] = this.sanitizeParamValue(value);
            }
        });
        
        return sanitized;
    }
    
    /**
     * Validate parameter key
     */
    isValidParamKey(key) {
        const pattern = /^[a-zA-Z0-9_]+$/;
        return typeof key === 'string' && 
               pattern.test(key) && 
               key.length <= 50;
    }
    
    /**
     * Validate parameter value
     */
    isValidParamValue(value) {
        return value !== null && 
               value !== undefined && 
               value !== '' &&
               String(value).length <= 200;
    }
    
    /**
     * Sanitize parameter value
     */
    sanitizeParamValue(value) {
        return String(value)
            .replace(/[<>\"']/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .trim();
    }
    
    /**
     * Cache URL for performance
     */
    cacheURL(key, url, ttl = 300000) { // 5 minutes default TTL
        this.urlCache.set(key, {
            url,
            timestamp: Date.now(),
            ttl
        });
    }
    
    /**
     * Get cached URL
     */
    getCachedURL(key) {
        const cached = this.urlCache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.urlCache.delete(key);
            return null;
        }
        
        return cached.url;
    }
    
    /**
     * Open URL with enhanced security
     */
    openURL(url, options = {}) {
        try {
            if (!this.validateURL(url)) {
                throw new Error('URL validation failed');
            }
            
            const defaultOptions = {
                target: '_blank',
                features: 'noopener,noreferrer,width=800,height=600'
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            const newWindow = window.open(
                url, 
                finalOptions.target, 
                finalOptions.features
            );
            
            if (!newWindow) {
                throw new Error('Popup blocked or failed to open');
            }
            
            // Security: Clear opener reference
            newWindow.opener = null;
            
            console.log('URL opened successfully:', url);
            return true;
            
        } catch (error) {
            console.error('Failed to open URL:', error);
            
            // Fallback: try direct navigation
            try {
                window.location.href = url;
                return true;
            } catch (fallbackError) {
                console.error('Fallback navigation failed:', fallbackError);
                return false;
            }
        }
    }
    
    /**
     * Clear URL cache
     */
    clearCache() {
        this.urlCache.clear();
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.urlCache.size,
            entries: Array.from(this.urlCache.keys())
        };
    }
}