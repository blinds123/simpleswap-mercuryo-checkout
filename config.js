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