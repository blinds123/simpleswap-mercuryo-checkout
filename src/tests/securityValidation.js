/**
 * Security Implementation Validation
 * Comprehensive testing of security components and configurations
 */
class SecurityValidation {
    constructor() {
        this.testResults = [];
        this.securityManager = null;
        this.errors = [];
        this.warnings = [];
        
        this.initializeValidation();
    }
    
    /**
     * Initialize security validation
     */
    async initializeValidation() {
        console.log('🔒 Starting Security Validation...');
        
        try {
            // Initialize SecurityManager for testing
            this.securityManager = new SecurityManager();
            
            // Run all security tests
            await this.runAllSecurityTests();
            
            // Generate validation report
            this.generateSecurityReport();
            
        } catch (error) {
            console.error('Security validation failed:', error);
            this.errors.push(`Validation initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Run comprehensive security tests
     */
    async runAllSecurityTests() {
        const tests = [
            { name: 'CSP Headers', fn: () => this.validateCSPHeaders() },
            { name: 'Input Validation', fn: () => this.validateInputValidation() },
            { name: 'CSRF Protection', fn: () => this.validateCSRFProtection() },
            { name: 'URL Validation', fn: () => this.validateURLValidation() },
            { name: 'XSS Prevention', fn: () => this.validateXSSPrevention() },
            { name: 'Data Encryption', fn: () => this.validateDataEncryption() },
            { name: 'Rate Limiting', fn: () => this.validateRateLimiting() },
            { name: 'Security Headers', fn: () => this.validateSecurityHeaders() },
            { name: 'Content Sanitization', fn: () => this.validateContentSanitization() },
            { name: 'API Security', fn: () => this.validateAPISecurity() }
        ];
        
        for (const test of tests) {
            try {
                console.log(`Testing: ${test.name}`);
                const result = await test.fn();
                this.testResults.push({
                    name: test.name,
                    status: result.passed ? 'PASS' : 'FAIL',
                    details: result.details || [],
                    errors: result.errors || [],
                    warnings: result.warnings || []
                });
            } catch (error) {
                console.error(`Test ${test.name} failed:`, error);
                this.testResults.push({
                    name: test.name,
                    status: 'ERROR',
                    details: [],
                    errors: [error.message],
                    warnings: []
                });
            }
        }
    }
    
    /**
     * Validate Content Security Policy headers
     */
    validateCSPHeaders() {
        console.log('🔍 Validating CSP Headers...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            // Check meta CSP in index.html
            const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            
            if (!cspMeta) {
                errors.push('CSP meta tag not found in HTML');
            } else {
                const cspContent = cspMeta.getAttribute('content');
                details.push(`CSP Content: ${cspContent}`);
                
                // Validate CSP directives
                const requiredDirectives = [
                    'default-src',
                    'script-src',
                    'style-src',
                    'img-src',
                    'connect-src'
                ];
                
                for (const directive of requiredDirectives) {
                    if (!cspContent.includes(directive)) {
                        errors.push(`Missing CSP directive: ${directive}`);
                    } else {
                        details.push(`✓ Found directive: ${directive}`);
                    }
                }
                
                // Check for unsafe directives
                const unsafeDirectives = ['unsafe-eval', 'unsafe-inline'];
                for (const unsafe of unsafeDirectives) {
                    if (cspContent.includes(unsafe)) {
                        warnings.push(`Potentially unsafe CSP directive: ${unsafe}`);
                    }
                }
                
                // Validate allowed domains
                const allowedDomains = [
                    'simpleswap.io',
                    'exchange.mrcr.io',
                    'ipapi.co'
                ];
                
                for (const domain of allowedDomains) {
                    if (cspContent.includes(domain)) {
                        details.push(`✓ Allowed domain: ${domain}`);
                    } else {
                        warnings.push(`Domain not explicitly allowed: ${domain}`);
                    }
                }
            }
            
            // Check other security headers
            const securityHeaders = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection'
            ];
            
            for (const header of securityHeaders) {
                const meta = document.querySelector(`meta[http-equiv="${header}"]`);
                if (meta) {
                    details.push(`✓ Found header: ${header} = ${meta.getAttribute('content')}`);
                } else {
                    errors.push(`Missing security header: ${header}`);
                }
            }
            
        } catch (error) {
            errors.push(`CSP validation error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate input validation functionality
     */
    validateInputValidation() {
        console.log('🔍 Validating Input Validation...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            // Test amount validation
            const amountTests = [
                { input: '19.50', expected: true, description: 'Valid amount' },
                { input: '0', expected: false, description: 'Zero amount' },
                { input: '-10', expected: false, description: 'Negative amount' },
                { input: '10001', expected: false, description: 'Amount too large' },
                { input: 'abc', expected: false, description: 'Non-numeric input' },
                { input: '', expected: false, description: 'Empty input' }
            ];
            
            for (const test of amountTests) {
                const result = this.securityManager.validateInput('amount', test.input);
                if (result === test.expected) {
                    details.push(`✓ Amount validation: ${test.description}`);
                } else {
                    errors.push(`❌ Amount validation failed: ${test.description} (expected ${test.expected}, got ${result})`);
                }
            }
            
            // Test currency validation
            const currencyTests = [
                { input: 'USD', expected: true, description: 'Valid currency code' },
                { input: 'EUR', expected: true, description: 'Valid currency code' },
                { input: 'usd', expected: false, description: 'Lowercase currency' },
                { input: 'USDT', expected: false, description: 'Four character currency' },
                { input: '123', expected: false, description: 'Numeric currency' }
            ];
            
            for (const test of currencyTests) {
                const result = this.securityManager.validateInput('currency', test.input);
                if (result === test.expected) {
                    details.push(`✓ Currency validation: ${test.description}`);
                } else {
                    errors.push(`❌ Currency validation failed: ${test.description}`);
                }
            }
            
            // Test wallet address validation
            const walletTests = [
                { input: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', expected: true, description: 'Valid Bitcoin address' },
                { input: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', expected: true, description: 'Valid Bitcoin address (P2SH)' },
                { input: 'invalid_address', expected: false, description: 'Invalid address format' },
                { input: '', expected: false, description: 'Empty address' }
            ];
            
            for (const test of walletTests) {
                const result = this.securityManager.validateInput('walletAddress', test.input);
                if (result === test.expected) {
                    details.push(`✓ Wallet validation: ${test.description}`);
                } else {
                    errors.push(`❌ Wallet validation failed: ${test.description}`);
                }
            }
            
        } catch (error) {
            errors.push(`Input validation test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate CSRF protection
     */
    validateCSRFProtection() {
        console.log('🔍 Validating CSRF Protection...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            // Check CSRF token generation
            const token1 = this.securityManager.generateCSRFToken();
            const token2 = this.securityManager.generateCSRFToken();
            
            if (token1 && token1.length >= 32) {
                details.push(`✓ CSRF token generated with length: ${token1.length}`);
            } else {
                errors.push('CSRF token too short or invalid');
            }
            
            if (token1 !== token2) {
                details.push('✓ CSRF tokens are unique');
            } else {
                errors.push('CSRF tokens are not unique');
            }
            
            // Check CSRF token validation
            if (this.securityManager.validateCSRFToken(token1)) {
                details.push('✓ CSRF token validation works for valid token');
            } else {
                errors.push('CSRF token validation failed for valid token');
            }
            
            if (!this.securityManager.validateCSRFToken('invalid_token')) {
                details.push('✓ CSRF token validation rejects invalid token');
            } else {
                errors.push('CSRF token validation accepts invalid token');
            }
            
            // Check if CSRF token is set in SecurityManager
            if (this.securityManager.csrfToken) {
                details.push('✓ CSRF token is set in SecurityManager instance');
            } else {
                errors.push('CSRF token not set in SecurityManager instance');
            }
            
        } catch (error) {
            errors.push(`CSRF protection test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate URL validation functionality
     */
    validateURLValidation() {
        console.log('🔍 Validating URL Validation...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            const urlTests = [
                { url: 'https://simpleswap.io', expected: true, description: 'Valid SimpleSwap URL' },
                { url: 'https://exchange.mrcr.io', expected: true, description: 'Valid Mercuryo URL' },
                { url: 'https://ipapi.co', expected: true, description: 'Valid IP API URL' },
                { url: 'https://evil.com', expected: false, description: 'Disallowed domain' },
                { url: 'javascript:alert(1)', expected: false, description: 'JavaScript protocol' },
                { url: 'ftp://simpleswap.io', expected: false, description: 'Non-HTTP protocol' },
                { url: 'not_a_url', expected: false, description: 'Invalid URL format' }
            ];
            
            for (const test of urlTests) {
                const result = this.securityManager.validateURL(test.url);
                if (result === test.expected) {
                    details.push(`✓ URL validation: ${test.description}`);
                } else {
                    errors.push(`❌ URL validation failed: ${test.description} (expected ${test.expected}, got ${result})`);
                }
            }
            
        } catch (error) {
            errors.push(`URL validation test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate XSS prevention measures
     */
    validateXSSPrevention() {
        console.log('🔍 Validating XSS Prevention...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            const xssTests = [
                { input: '<script>alert("xss")</script>', description: 'Script tag injection' },
                { input: 'javascript:alert(1)', description: 'JavaScript protocol' },
                { input: 'onclick="alert(1)"', description: 'Event handler injection' },
                { input: '<img src="x" onerror="alert(1)">', description: 'Image tag with event' },
                { input: '"><script>alert(1)</script>', description: 'Attribute escape attempt' }
            ];
            
            for (const test of xssTests) {
                const sanitized = this.securityManager.sanitizeInput(test.input);
                
                if (sanitized !== test.input) {
                    details.push(`✓ XSS prevention: ${test.description} was sanitized`);
                    
                    // Check if dangerous patterns are removed
                    if (sanitized.includes('<script>') || 
                        sanitized.includes('javascript:') || 
                        sanitized.includes('onerror=') ||
                        sanitized.includes('onclick=')) {
                        errors.push(`❌ XSS prevention incomplete for: ${test.description}`);
                    }
                } else {
                    warnings.push(`⚠️ XSS input not sanitized: ${test.description}`);
                }
            }
            
            // Test safe input passes through
            const safeInput = 'Normal text input 123';
            const safeSanitized = this.securityManager.sanitizeInput(safeInput);
            if (safeSanitized === safeInput.trim()) {
                details.push('✓ Safe input passes through sanitization');
            } else {
                errors.push('Safe input was modified during sanitization');
            }
            
        } catch (error) {
            errors.push(`XSS prevention test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate data encryption functionality
     */
    async validateDataEncryption() {
        console.log('🔍 Validating Data Encryption...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            // Test data encryption
            const testData = { userId: '12345', amount: '19.50' };
            const encrypted = await this.securityManager.encryptData(testData);
            
            if (encrypted && encrypted.encrypted && encrypted.iv && encrypted.key) {
                details.push('✓ Data encryption returns required components');
                details.push(`✓ Encrypted data length: ${encrypted.encrypted.length}`);
                details.push(`✓ IV length: ${encrypted.iv.length}`);
            } else {
                errors.push('Data encryption missing required components');
            }
            
            // Verify encrypted data is different from original
            const encryptedStr = JSON.stringify(encrypted.encrypted);
            const originalStr = JSON.stringify(testData);
            
            if (encryptedStr !== originalStr) {
                details.push('✓ Encrypted data differs from original');
            } else {
                errors.push('Encrypted data same as original');
            }
            
        } catch (error) {
            errors.push(`Data encryption test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate rate limiting functionality
     */
    validateRateLimiting() {
        console.log('🔍 Validating Rate Limiting...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            const identifier = 'test_user_123';
            
            // Test normal usage (should not be rate limited)
            if (!this.securityManager.isRateLimited(identifier, 5, 60000)) {
                details.push('✓ Normal usage not rate limited');
            } else {
                errors.push('Normal usage incorrectly rate limited');
            }
            
            // Test rate limit threshold
            let rateLimited = false;
            for (let i = 0; i < 6; i++) {
                rateLimited = this.securityManager.isRateLimited(identifier, 5, 60000);
                if (rateLimited) break;
            }
            
            if (rateLimited) {
                details.push('✓ Rate limiting triggers after threshold');
            } else {
                errors.push('Rate limiting does not trigger after threshold');
            }
            
            // Test different identifier is not affected
            const identifier2 = 'test_user_456';
            if (!this.securityManager.isRateLimited(identifier2, 5, 60000)) {
                details.push('✓ Different identifier not affected by rate limit');
            } else {
                errors.push('Different identifier affected by rate limit');
            }
            
        } catch (error) {
            errors.push(`Rate limiting test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate security headers configuration
     */
    validateSecurityHeaders() {
        console.log('🔍 Validating Security Headers...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            const expectedHeaders = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            };
            
            // Check if headers are initialized in SecurityManager
            this.securityManager.initializeSecurityHeaders();
            
            for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
                const actualValue = this.securityManager.securityHeaders.get(header);
                
                if (actualValue === expectedValue) {
                    details.push(`✓ Security header: ${header} = ${actualValue}`);
                } else {
                    errors.push(`❌ Security header mismatch: ${header} (expected: ${expectedValue}, got: ${actualValue})`);
                }
            }
            
            // Check for HSTS header
            const hstsHeader = this.securityManager.securityHeaders.get('Strict-Transport-Security');
            if (hstsHeader && hstsHeader.includes('max-age=')) {
                details.push(`✓ HSTS header configured: ${hstsHeader}`);
            } else {
                warnings.push('HSTS header not configured or incomplete');
            }
            
        } catch (error) {
            errors.push(`Security headers test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate content sanitization
     */
    validateContentSanitization() {
        console.log('🔍 Validating Content Sanitization...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            const sanitizationTests = [
                { 
                    input: '  Normal text with spaces  ', 
                    expectedCheck: (output) => output === 'Normal text with spaces',
                    description: 'Trim whitespace'
                },
                { 
                    input: 'Text with <tags> and "quotes"', 
                    expectedCheck: (output) => !output.includes('<') && !output.includes('"'),
                    description: 'Remove dangerous characters'
                },
                { 
                    input: 'JAVASCRIPT:alert(1)', 
                    expectedCheck: (output) => !output.toLowerCase().includes('javascript:'),
                    description: 'Remove javascript protocol'
                },
                { 
                    input: 'Text with onload=malicious', 
                    expectedCheck: (output) => !output.includes('onload='),
                    description: 'Remove event handlers'
                }
            ];
            
            for (const test of sanitizationTests) {
                const sanitized = this.securityManager.sanitizeInput(test.input);
                
                if (test.expectedCheck(sanitized)) {
                    details.push(`✓ Content sanitization: ${test.description}`);
                } else {
                    errors.push(`❌ Content sanitization failed: ${test.description} (input: "${test.input}", output: "${sanitized}")`);
                }
            }
            
        } catch (error) {
            errors.push(`Content sanitization test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Validate API security measures
     */
    validateAPISecurity() {
        console.log('🔍 Validating API Security...');
        
        const details = [];
        const errors = [];
        const warnings = [];
        
        try {
            // Check if API endpoints are validated
            const apiTests = [
                'https://api.simpleswap.io/test',
                'https://exchange.mrcr.io/test',
                'https://malicious.com/api'
            ];
            
            for (const url of apiTests) {
                const isValid = this.securityManager.validateURL(url);
                const shouldBeValid = url.includes('simpleswap.io') || url.includes('mrcr.io');
                
                if (isValid === shouldBeValid) {
                    details.push(`✓ API URL validation: ${url}`);
                } else {
                    errors.push(`❌ API URL validation failed: ${url}`);
                }
            }
            
            // Check for security monitoring initialization
            if (typeof this.securityManager.initializeSecurityMonitoring === 'function') {
                details.push('✓ Security monitoring function available');
            } else {
                errors.push('Security monitoring function not available');
            }
            
            // Check for CSP violation handling
            if (typeof this.securityManager.handleCSPViolation === 'function') {
                details.push('✓ CSP violation handler available');
            } else {
                warnings.push('CSP violation handler not available');
            }
            
        } catch (error) {
            errors.push(`API security test error: ${error.message}`);
        }
        
        return {
            passed: errors.length === 0,
            details,
            errors,
            warnings
        };
    }
    
    /**
     * Generate comprehensive security report
     */
    generateSecurityReport() {
        console.log('\n🔒 SECURITY VALIDATION REPORT');
        console.log('=' .repeat(50));
        
        let totalTests = this.testResults.length;
        let passedTests = this.testResults.filter(test => test.status === 'PASS').length;
        let failedTests = this.testResults.filter(test => test.status === 'FAIL').length;
        let errorTests = this.testResults.filter(test => test.status === 'ERROR').length;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Errors: ${errorTests} ⚠️`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log('\nDETAILED RESULTS:');
        console.log('-' .repeat(30));
        
        for (const test of this.testResults) {
            const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`\n${statusIcon} ${test.name} - ${test.status}`);
            
            if (test.details.length > 0) {
                test.details.forEach(detail => console.log(`  ${detail}`));
            }
            
            if (test.warnings.length > 0) {
                test.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
            }
            
            if (test.errors.length > 0) {
                test.errors.forEach(error => console.log(`  ❌ ${error}`));
            }
        }
        
        // Security recommendations
        console.log('\nSECURITY RECOMMENDATIONS:');
        console.log('-' .repeat(30));
        
        const allWarnings = this.testResults.flatMap(test => test.warnings);
        const allErrors = this.testResults.flatMap(test => test.errors);
        
        if (allErrors.length === 0 && allWarnings.length === 0) {
            console.log('✅ All security tests passed! No immediate recommendations.');
        } else {
            if (allErrors.length > 0) {
                console.log('\nCRITICAL ISSUES (Must Fix):');
                allErrors.forEach(error => console.log(`  🚨 ${error}`));
            }
            
            if (allWarnings.length > 0) {
                console.log('\nWARNINGS (Recommended):');
                allWarnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
            }
        }
        
        // Overall security score
        const securityScore = (passedTests / totalTests) * 100;
        let securityGrade = 'F';
        
        if (securityScore >= 95) securityGrade = 'A+';
        else if (securityScore >= 90) securityGrade = 'A';
        else if (securityScore >= 85) securityGrade = 'B+';
        else if (securityScore >= 80) securityGrade = 'B';
        else if (securityScore >= 75) securityGrade = 'C+';
        else if (securityScore >= 70) securityGrade = 'C';
        else if (securityScore >= 60) securityGrade = 'D';
        
        console.log(`\n🏆 SECURITY GRADE: ${securityGrade} (${securityScore.toFixed(1)}%)`);
        console.log('=' .repeat(50));
        
        return {
            totalTests,
            passedTests,
            failedTests,
            errorTests,
            successRate: securityScore,
            grade: securityGrade,
            details: this.testResults
        };
    }
    
    /**
     * Get validation results
     */
    getResults() {
        return {
            testResults: this.testResults,
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(t => t.status === 'PASS').length,
            failedTests: this.testResults.filter(t => t.status === 'FAIL').length,
            errorTests: this.testResults.filter(t => t.status === 'ERROR').length
        };
    }
}

// Auto-run validation if this script is loaded directly
if (typeof window !== 'undefined') {
    window.SecurityValidation = SecurityValidation;
    
    // Auto-run if in debug mode
    if (new URLSearchParams(window.location.search).has('validate-security')) {
        document.addEventListener('DOMContentLoaded', () => {
            new SecurityValidation();
        });
    }
}