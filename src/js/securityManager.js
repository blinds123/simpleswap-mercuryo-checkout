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