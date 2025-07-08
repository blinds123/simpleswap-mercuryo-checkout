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