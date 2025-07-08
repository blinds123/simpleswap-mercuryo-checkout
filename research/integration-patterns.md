# Integration Patterns for SimpleSwap + Mercuryo

## Deep Link Construction Strategy

### SimpleSwap Widget URL Pattern
```javascript
const buildSimpleSwapURL = (params) => {
  const baseURL = 'https://simpleswap.io/widget/demo';
  const urlParams = new URLSearchParams({
    defaultCurrencyFrom: params.fromCurrency || 'eur',
    defaultCurrencyTo: params.toCurrency || 'btc',
    defaultPaymentAmount: params.amount || '19.50',
    colorTheme: params.theme || 'white',
    language: params.language || 'english',
    partnerId: params.partnerId || 'your_partner_id'
  });
  
  return `${baseURL}?${urlParams.toString()}`;
};
```

### Mercuryo Widget URL Pattern
```javascript
const buildMercuryoURL = (params) => {
  const baseURL = 'https://exchange.mrcr.io/';
  const urlParams = new URLSearchParams({
    widget_id: params.widgetId,
    merchant_transaction_id: params.transactionId,
    address: params.walletAddress,
    currency_from: params.fromCurrency || 'EUR',
    currency_to: params.toCurrency || 'BTC',
    amount: params.amount || '19.50'
  });
  
  return `${baseURL}?${urlParams.toString()}`;
};
```

## Payment Method Forcing Strategy

### Approach 1: URL Parameter Control
- SimpleSwap doesn't have direct payment method selection in URL
- Must rely on redirect to Mercuryo for payment method control
- Can pre-configure Mercuryo widget to highlight specific payment methods

### Approach 2: API-First Approach
```javascript
// 1. Get available payment methods from Mercuryo
const getPaymentMethods = async (country) => {
  const response = await fetch(`https://api.mercuryo.io/v1.6/public/card-countries`);
  const data = await response.json();
  return data.filter(method => method.country === country);
};

// 2. Filter to force Mercuryo
const forcePaymentMethod = (methods) => {
  return methods.filter(method => method.provider === 'mercuryo');
};
```

## Regional Validation Implementation

### Geo-Location Detection
```javascript
const validateRegion = async (userIP) => {
  const response = await fetch(`https://api.mercuryo.io/v1.6/public/data-by-ip`, {
    headers: {
      'X-User-IP': userIP
    }
  });
  
  const locationData = await response.json();
  const supportedCountries = ['US', 'CA', 'AU'];
  
  return {
    isSupported: supportedCountries.includes(locationData.country),
    country: locationData.country,
    restrictions: getCountryRestrictions(locationData.country)
  };
};

const getCountryRestrictions = (country) => {
  const restrictions = {
    'US': ['Hawaii', 'Louisiana', 'New York'],
    'CA': [],
    'AU': []
  };
  
  return restrictions[country] || [];
};
```

## Error Handling Patterns

### Graceful Fallback Strategy
```javascript
const handlePaymentMethodFallback = (error, userCountry) => {
  if (error.code === 'MERCURYO_UNAVAILABLE') {
    // Log the error but don't fail completely
    console.warn('Mercuryo unavailable, showing alternative options');
    
    // Return alternative payment methods
    return getAlternativePaymentMethods(userCountry);
  }
  
  throw error; // Re-throw other errors
};
```

### Progressive Enhancement
```javascript
const initializePaymentWidget = async (config) => {
  try {
    // Try Mercuryo first
    const mercuryoWidget = await initializeMercuryo(config);
    return mercuryoWidget;
  } catch (error) {
    console.error('Mercuryo initialization failed:', error);
    
    // Fall back to SimpleSwap default
    return initializeSimpleSwapDefault(config);
  }
};
```

## Wallet Address Handling

### Clipboard Integration
```javascript
const copyToClipboard = async (address) => {
  try {
    await navigator.clipboard.writeText(address);
    showNotification('Wallet address copied to clipboard');
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = address;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('Wallet address copied to clipboard');
  }
};
```

### Address Validation
```javascript
const validateWalletAddress = (address, cryptocurrency) => {
  const patterns = {
    'btc': /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    'eth': /^0x[a-fA-F0-9]{40}$/,
    // Add more patterns as needed
  };
  
  const pattern = patterns[cryptocurrency.toLowerCase()];
  return pattern ? pattern.test(address) : false;
};
```

## Mobile Optimization Patterns

### Responsive Design
```css
/* Mobile-first approach */
.checkout-container {
  max-width: 100%;
  padding: 16px;
}

@media (min-width: 768px) {
  .checkout-container {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px;
  }
}

/* Touch-friendly button sizing */
.buy-button {
  min-height: 48px;
  font-size: 16px;
  padding: 12px 24px;
}
```

### Touch Interactions
```javascript
const handleTouchInteraction = (element) => {
  element.addEventListener('touchstart', (e) => {
    element.classList.add('touch-active');
  });
  
  element.addEventListener('touchend', (e) => {
    element.classList.remove('touch-active');
  });
};
```

## Performance Optimization

### Lazy Loading
```javascript
const loadPaymentWidget = async () => {
  const widget = await import('./paymentWidget.js');
  return widget.initialize();
};
```

### Caching Strategy
```javascript
const cacheManager = {
  rates: new Map(),
  
  async getRates(currency) {
    const cacheKey = `rates_${currency}`;
    const cached = this.rates.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.data;
    }
    
    const rates = await fetchRates(currency);
    this.rates.set(cacheKey, {
      data: rates,
      timestamp: Date.now()
    });
    
    return rates;
  }
};
```

## Security Best Practices

### Input Sanitization
```javascript
const sanitizeInput = (input) => {
  return input.replace(/[<>\"']/g, '');
};

const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 10000;
};
```

### CSRF Protection
```javascript
const generateCSRFToken = () => {
  return crypto.randomUUID();
};

const validateCSRFToken = (token, storedToken) => {
  return token === storedToken;
};
```