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