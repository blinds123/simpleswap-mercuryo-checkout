# Phase 1: SimpleSwap Mercuryo Checkout - Skeleton Implementation

## Model Assignments

### Claude Opus 4 (Orchestrator)
- **Role**: Primary decision maker and code reviewer
- **Responsibilities**:
  - Top-level planning and architecture decisions
  - Phase transition approval (Phase 1 → Phase 2 → Phase 3)
  - Documentation validation and API endpoint verification
  - Agent delegation and task coordination
  - Final code review and quality assurance
  - Error handling strategy approval
  - Regional restriction validation oversight

### Claude Sonnet 4 (Sub-Agents)
- **Role**: Implementation specialist and research executor
- **Responsibilities**:
  - Documentation scraping and URL structure analysis
  - Code generation for all components
  - Unit testing and CLI simulation
  - UI interaction implementation
  - Modular component building
  - API integration development
  - Mobile optimization implementation
  - Error handling implementation

## Project Overview

Build a skeleton implementation of a frictionless checkout landing page that integrates with SimpleSwap's API to create pre-configured deep links forcing Mercuryo as the payment method. This phase focuses on basic functionality with €19.50 pre-fills, wallet address copying, and foundational error handling.

## Core Requirements - Phase 1

### Functional Requirements
- **Pre-fill amount**: €19.50 (fixed, hardcoded)
- **Payment method**: Mercuryo highlighted (green styling)
- **Supported regions**: Basic validation for AU/CA/USA
- **Platform support**: Responsive design foundation
- **Wallet interaction**: Basic clipboard copy functionality
- **Error handling**: Console logging and basic fallbacks
- **Architecture**: Modular JavaScript components

### Technical Constraints
- **File size limit**: Maximum 500 lines per file
- **No external dependencies**: Pure JavaScript/HTML/CSS
- **Mobile-first**: Responsive design approach
- **Performance**: Fast loading, minimal dependencies
- **Security**: Basic input validation

## Research Context

### SimpleSwap API Integration
Based on research from `/research/simpleswap/api-overview.md`:

**Key API Endpoints**:
- `GET /get_estimated` - Calculate exchange amounts including fees
- `POST /create_exchange` - Create cryptocurrency exchanges
- **Base URL**: `https://api.simpleswap.io/`

**Widget URL Pattern**:
```javascript
https://simpleswap.io/widget/demo?defaultCurrencyFrom="eur"&defaultCurrencyTo="btc"&defaultPaymentAmount=19.50&colorTheme="white"&language="english"&partnerId="your_partner_id"
```

**Critical Parameters**:
- `defaultCurrencyFrom`: "eur" (fixed for €19.50)
- `defaultCurrencyTo`: "btc" (or target crypto)
- `defaultPaymentAmount`: 19.50 (fixed)
- `partnerId`: Required for affiliate tracking

### Mercuryo Integration
Based on research from `/research/mercuryo/api-overview.md`:

**Regional Availability**:
- **US**: All states except Hawaii, Louisiana, New York
- **Canada**: Full support via MONEYMAPLE TECH LTD
- **Australia**: Off-ramp services available

**Widget Configuration**:
```javascript
{
  widget_id: 'your_widget_id',
  merchantTransactionId: 'unique_transaction_id',
  address: 'blockchain_address',
  currency_from: 'EUR',
  amount: '19.50'
}
```

**Base URL**: `https://exchange.mrcr.io/`

## Implementation Blueprint

### Phase 1 Architecture
```
/
├── index.html              # Main landing page with embedded CSS
├── deepLinkBuilder.js      # SimpleSwap URL construction (< 500 lines)
├── walletHandler.js        # Wallet address management (< 500 lines)
├── geoRedirector.js        # Regional access control (< 500 lines)
├── config.js               # Environment configuration (< 500 lines)
└── README.md               # Basic setup instructions
```

### Core Components Implementation

#### 1. index.html (Main Landing Page)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SimpleSwap Mercuryo Checkout</title>
    <style>
        /* Mobile-first responsive design */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .checkout-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 32px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .amount-display {
            font-size: 48px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .payment-method {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        
        .buy-button {
            background: #10b981;
            color: white;
            border: none;
            padding: 16px 32px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            min-height: 48px;
            transition: all 0.2s;
        }
        
        .buy-button:hover {
            background: #059669;
            transform: translateY(-2px);
        }
        
        .buy-button:active {
            transform: translateY(0);
        }
        
        .error-message {
            color: #ef4444;
            margin-top: 16px;
            padding: 12px;
            background: #fef2f2;
            border-radius: 8px;
            display: none;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        /* Mobile optimizations */
        @media (max-width: 480px) {
            .checkout-container {
                padding: 24px;
            }
            
            .amount-display {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="checkout-container">
        <div class="amount-display">€19.50</div>
        <div class="payment-method">✓ Mercuryo</div>
        
        <button class="buy-button" id="buyButton">
            Buy Crypto
        </button>
        
        <div class="error-message" id="errorMessage"></div>
    </div>
    
    <script src="config.js"></script>
    <script src="geoRedirector.js"></script>
    <script src="walletHandler.js"></script>
    <script src="deepLinkBuilder.js"></script>
    
    <script>
        // Initialize application
        document.addEventListener('DOMContentLoaded', async () => {
            const app = new SimpleSwapCheckout();
            await app.initialize();
        });
    </script>
</body>
</html>
```

#### 2. deepLinkBuilder.js (URL Construction)
```javascript
/**
 * SimpleSwap Deep Link Builder
 * Constructs URLs for SimpleSwap widget with Mercuryo forced
 */
class DeepLinkBuilder {
    constructor(config) {
        this.config = config;
        this.baseURL = 'https://simpleswap.io/widget/demo';
        this.mercuryoURL = 'https://exchange.mrcr.io/';
    }
    
    /**
     * Build SimpleSwap widget URL with pre-configured parameters
     */
    buildSimpleSwapURL(params = {}) {
        const defaultParams = {
            defaultCurrencyFrom: 'eur',
            defaultCurrencyTo: 'btc',
            defaultPaymentAmount: '19.50',
            colorTheme: 'white',
            language: 'english',
            partnerId: this.config.SIMPLESWAP_PARTNER_ID
        };
        
        const finalParams = { ...defaultParams, ...params };
        const urlParams = new URLSearchParams();
        
        Object.entries(finalParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                urlParams.append(key, value);
            }
        });
        
        const url = `${this.baseURL}?${urlParams.toString()}`;
        console.log('SimpleSwap URL generated:', url);
        return url;
    }
    
    /**
     * Build Mercuryo widget URL with transaction details
     */
    buildMercuryoURL(transactionId, walletAddress) {
        const params = new URLSearchParams({
            widget_id: this.config.MERCURYO_WIDGET_ID,
            merchant_transaction_id: transactionId,
            address: walletAddress,
            currency_from: 'EUR',
            currency_to: 'BTC',
            amount: '19.50'
        });
        
        const url = `${this.mercuryoURL}?${params.toString()}`;
        console.log('Mercuryo URL generated:', url);
        return url;
    }
    
    /**
     * Generate unique transaction ID
     */
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `tx_${timestamp}_${random}`;
    }
    
    /**
     * Open URL in new tab/window
     */
    openURL(url) {
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
            return true;
        } catch (error) {
            console.error('Failed to open URL:', error);
            return false;
        }
    }
}
```

#### 3. walletHandler.js (Wallet Management)
```javascript
/**
 * Wallet Address Handler
 * Manages wallet address generation, validation, and clipboard operations
 */
class WalletHandler {
    constructor() {
        this.currentAddress = null;
        this.addressPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // Bitcoin address pattern
    }
    
    /**
     * Generate sample wallet address for demo
     */
    generateSampleAddress() {
        // Generate demo Bitcoin address for testing
        const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = '1';
        
        for (let i = 0; i < 33; i++) {
            address += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.currentAddress = address;
        console.log('Generated sample wallet address:', address);
        return address;
    }
    
    /**
     * Validate wallet address format
     */
    validateAddress(address) {
        if (!address || typeof address !== 'string') {
            return false;
        }
        
        return this.addressPattern.test(address);
    }
    
    /**
     * Copy wallet address to clipboard
     */
    async copyToClipboard(address = this.currentAddress) {
        if (!address) {
            throw new Error('No wallet address available');
        }
        
        try {
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(address);
                console.log('Address copied to clipboard (modern API)');
                return true;
            }
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = address;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                console.log('Address copied to clipboard (fallback)');
                return true;
            }
            
            throw new Error('Clipboard copy failed');
            
        } catch (error) {
            console.error('Failed to copy address:', error);
            throw error;
        }
    }
    
    /**
     * Show visual feedback for copy operation
     */
    showCopyFeedback(button) {
        const originalText = button.textContent;
        button.textContent = '✓ Address Copied!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
    
    /**
     * Get current wallet address
     */
    getCurrentAddress() {
        return this.currentAddress;
    }
}
```

#### 4. geoRedirector.js (Regional Control)
```javascript
/**
 * Geo-location and Regional Access Control
 * Validates user region and handles restrictions
 */
class GeoRedirector {
    constructor() {
        this.supportedCountries = ['US', 'CA', 'AU'];
        this.countryRestrictions = {
            'US': ['Hawaii', 'Louisiana', 'New York'],
            'CA': [],
            'AU': []
        };
        this.userLocation = null;
    }
    
    /**
     * Detect user's location using multiple methods
     */
    async detectUserLocation() {
        try {
            // Method 1: Try IP-based detection
            const ipLocation = await this.getLocationByIP();
            if (ipLocation) {
                this.userLocation = ipLocation;
                return ipLocation;
            }
            
            // Method 2: Browser geolocation API (requires user permission)
            const geoLocation = await this.getLocationByBrowser();
            if (geoLocation) {
                this.userLocation = geoLocation;
                return geoLocation;
            }
            
            // Method 3: Fallback to timezone detection
            const timezoneLocation = this.getLocationByTimezone();
            this.userLocation = timezoneLocation;
            return timezoneLocation;
            
        } catch (error) {
            console.error('Location detection failed:', error);
            // Default to US if detection fails
            this.userLocation = { country: 'US', region: 'Unknown' };
            return this.userLocation;
        }
    }
    
    /**
     * Get location by IP address
     */
    async getLocationByIP() {
        try {
            // Using a free IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            return {
                country: data.country_code,
                region: data.region,
                city: data.city,
                method: 'ip'
            };
        } catch (error) {
            console.error('IP geolocation failed:', error);
            return null;
        }
    }
    
    /**
     * Get location using browser geolocation API
     */
    async getLocationByBrowser() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Convert coordinates to country (would need reverse geocoding service)
                        // For skeleton implementation, return approximate location
                        resolve({
                            country: 'US', // Default for skeleton
                            region: 'Unknown',
                            method: 'browser'
                        });
                    } catch (error) {
                        resolve(null);
                    }
                },
                () => resolve(null),
                { timeout: 5000 }
            );
        });
    }
    
    /**
     * Get location by timezone
     */
    getLocationByTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Simple timezone to country mapping
        const timezoneMap = {
            'America/New_York': 'US',
            'America/Los_Angeles': 'US',
            'America/Chicago': 'US',
            'America/Denver': 'US',
            'America/Toronto': 'CA',
            'America/Vancouver': 'CA',
            'Australia/Sydney': 'AU',
            'Australia/Melbourne': 'AU'
        };
        
        const country = timezoneMap[timezone] || 'US';
        
        return {
            country,
            region: 'Unknown',
            timezone,
            method: 'timezone'
        };
    }
    
    /**
     * Validate if user's location is supported
     */
    async validateRegionalAccess() {
        const location = await this.detectUserLocation();
        
        const validation = {
            isSupported: this.supportedCountries.includes(location.country),
            country: location.country,
            region: location.region,
            restrictions: this.countryRestrictions[location.country] || [],
            method: location.method
        };
        
        console.log('Regional validation result:', validation);
        return validation;
    }
    
    /**
     * Check if Mercuryo is available for user's region
     */
    isMercuryoAvailable(country) {
        const availability = {
            'US': true, // except Hawaii, Louisiana, New York
            'CA': true,
            'AU': true
        };
        
        return availability[country] || false;
    }
    
    /**
     * Handle regional restrictions
     */
    handleRegionalRestriction(validation) {
        if (!validation.isSupported) {
            return {
                allowed: false,
                message: `Service not available in ${validation.country}. Supported regions: Australia, Canada, USA.`
            };
        }
        
        if (validation.restrictions.length > 0) {
            return {
                allowed: false,
                message: `Service restricted in ${validation.region}. Restricted areas: ${validation.restrictions.join(', ')}.`
            };
        }
        
        return {
            allowed: true,
            message: 'Service available in your region.'
        };
    }
}
```

#### 5. config.js (Configuration)
```javascript
/**
 * Configuration settings for SimpleSwap Mercuryo integration
 */
const APP_CONFIG = {
    // SimpleSwap Configuration
    SIMPLESWAP_PARTNER_ID: 'demo_partner_id', // Replace with actual partner ID
    SIMPLESWAP_API_KEY: 'demo_api_key', // Replace with actual API key
    
    // Mercuryo Configuration
    MERCURYO_WIDGET_ID: 'demo_widget_id', // Replace with actual widget ID
    MERCURYO_SIGN_KEY: 'demo_sign_key', // Replace with actual sign key
    
    // Application Settings
    DEFAULT_AMOUNT: '19.50',
    DEFAULT_CURRENCY_FROM: 'EUR',
    DEFAULT_CURRENCY_TO: 'BTC',
    
    // Regional Settings
    SUPPORTED_COUNTRIES: ['US', 'CA', 'AU'],
    
    // Environment
    ENVIRONMENT: 'development', // development | production
    
    // URLs
    URLS: {
        SIMPLESWAP_WIDGET: 'https://simpleswap.io/widget/demo',
        MERCURYO_WIDGET: 'https://exchange.mrcr.io/',
        MERCURYO_SANDBOX: 'https://sandbox-exchange.mrcr.io/'
    }
};

/**
 * Main Application Class
 */
class SimpleSwapCheckout {
    constructor() {
        this.config = APP_CONFIG;
        this.deepLinkBuilder = new DeepLinkBuilder(this.config);
        this.walletHandler = new WalletHandler();
        this.geoRedirector = new GeoRedirector();
        this.isInitialized = false;
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing SimpleSwap Checkout...');
            
            // Validate regional access
            const validation = await this.geoRedirector.validateRegionalAccess();
            const accessResult = this.geoRedirector.handleRegionalRestriction(validation);
            
            if (!accessResult.allowed) {
                this.showError(accessResult.message);
                return;
            }
            
            // Generate sample wallet address
            this.walletHandler.generateSampleAddress();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const buyButton = document.getElementById('buyButton');
        buyButton.addEventListener('click', (e) => this.handleBuyClick(e));
    }
    
    /**
     * Handle buy button click
     */
    async handleBuyClick(event) {
        event.preventDefault();
        
        if (!this.isInitialized) {
            this.showError('Application not initialized');
            return;
        }
        
        const button = event.target;
        button.classList.add('loading');
        
        try {
            // Copy wallet address to clipboard
            await this.walletHandler.copyToClipboard();
            this.walletHandler.showCopyFeedback(button);
            
            // Generate transaction ID
            const transactionId = this.deepLinkBuilder.generateTransactionId();
            
            // Get wallet address
            const walletAddress = this.walletHandler.getCurrentAddress();
            
            // Build deep link URL
            const deepLinkURL = this.deepLinkBuilder.buildSimpleSwapURL({
                // Add any additional parameters here
            });
            
            // Open deep link
            const opened = this.deepLinkBuilder.openURL(deepLinkURL);
            
            if (!opened) {
                throw new Error('Failed to open payment page');
            }
            
        } catch (error) {
            console.error('Buy process failed:', error);
            this.showError('Failed to process purchase. Please try again.');
        } finally {
            button.classList.remove('loading');
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}
```

## Validation Gates

### Phase 1 Validation Commands
```bash
# File structure validation
ls -la /path/to/project/

# HTML validation (manual check)
# - Valid HTML5 structure
# - Responsive meta tags
# - All required IDs present

# JavaScript syntax validation
node -c deepLinkBuilder.js
node -c walletHandler.js
node -c geoRedirector.js
node -c config.js

# Basic functionality test
# - Open index.html in browser
# - Click "Buy Crypto" button
# - Check console for logs
# - Verify wallet address is copied
# - Verify deep link opens in new tab
```

### Success Criteria - Phase 1
- [ ] €19.50 amount displays correctly
- [ ] Mercuryo shown with green highlight
- [ ] Buy button generates and copies wallet address
- [ ] Deep link opens SimpleSwap widget
- [ ] Regional validation works for AU/CA/USA
- [ ] Basic error handling displays messages
- [ ] Mobile responsive design functions
- [ ] All JavaScript files under 500 lines
- [ ] Console logging provides clear feedback

## Implementation Tasks (Sequential Order)

### Sonnet 4 Sub-Agent Tasks
1. **Create HTML Structure** (20 min)
   - Build responsive layout with embedded CSS
   - Implement mobile-first design principles
   - Add proper semantic HTML structure

2. **Implement Configuration** (15 min)
   - Create config.js with all required settings
   - Set up application class structure
   - Define environment variables

3. **Build Deep Link Builder** (30 min)
   - Implement URL construction logic
   - Add transaction ID generation
   - Create URL opening functionality

4. **Develop Wallet Handler** (25 min)
   - Implement clipboard copy functionality
   - Add wallet address validation
   - Create visual feedback system

5. **Create Geo Redirector** (35 min)
   - Implement IP-based location detection
   - Add regional validation logic
   - Create restriction handling

6. **Integration Testing** (20 min)
   - Test all components together
   - Validate error handling
   - Check mobile responsiveness

### Opus 4 Orchestrator Tasks
1. **Architecture Review** (10 min)
   - Validate component separation
   - Approve file structure
   - Review security considerations

2. **Quality Assurance** (15 min)
   - Code review for all components
   - Validate against requirements
   - Approve for Phase 2 transition

## Known Limitations - Phase 1

### Technical Limitations
- **Hardcoded values**: €19.50 amount and EUR currency
- **Demo wallet addresses**: Generated sample addresses only
- **Basic error handling**: Console logging and simple messages
- **No real API calls**: Skeleton implementation only
- **Limited testing**: Manual browser testing only

### Functional Limitations
- **Payment method forcing**: URL-based approach only
- **Regional detection**: Simple IP geolocation
- **No webhook handling**: Transaction status tracking unavailable
- **No real authentication**: Demo keys and IDs only

## Next Phase Requirements

### Phase 2 Transition Criteria
- All Phase 1 success criteria met
- Opus 4 approval for architecture
- Component integration validated
- Mobile responsiveness confirmed
- Error handling functional
- Documentation complete

### Phase 2 Preparation
- Research production API endpoints
- Implement real authentication
- Add comprehensive error handling
- Create production-ready security measures
- Implement real webhook handling

## PRP Quality Score

**Confidence Level: 8/10**

### Strengths
- Comprehensive research foundation
- Clear component separation
- Detailed implementation examples
- Mobile-first responsive design
- Proper error handling framework

### Areas for Improvement
- Real API integration needed for production
- More comprehensive testing required
- Security hardening necessary
- Performance optimization needed
- Cross-browser compatibility testing

This PRP provides a solid foundation for one-pass skeleton implementation with clear transition path to production-ready Phase 2.