# SimpleSwap Mercuryo Checkout - Phase 1 Skeleton

A frictionless checkout landing page that integrates with SimpleSwap's API to create pre-configured deep links forcing Mercuryo as the payment method.

## 🎯 Features

- **Fixed Amount**: €19.50 pre-filled for crypto purchase
- **Payment Method**: Mercuryo highlighted as preferred option
- **Regional Support**: Available in Australia, Canada, and USA
- **Mobile Responsive**: Mobile-first design approach
- **Wallet Integration**: Sample wallet address generation and clipboard copy
- **Deep Link Support**: Direct integration with SimpleSwap widget

## 🚀 Quick Start

```bash
# 1. Clone or download the project files
cd context-swap

# 2. Serve the files using a local web server
python -m http.server 8000
# OR
npx serve .

# 3. Open your browser
http://localhost:8000
```

## 🏗️ Project Structure

```
/
├── index.html              # Main landing page with embedded CSS
├── config.js               # Configuration and main application class
├── deepLinkBuilder.js      # SimpleSwap URL construction
├── walletHandler.js        # Wallet address management
├── geoRedirector.js        # Regional access control
├── research/               # API documentation research
├── PRPs/                   # Product Requirements Prompts
└── README.md               # This file
```

## 🔧 Configuration

Before production use, update the following values in `config.js`:

```javascript
const APP_CONFIG = {
    // Replace with your actual SimpleSwap credentials
    SIMPLESWAP_PARTNER_ID: 'your_actual_partner_id',
    SIMPLESWAP_API_KEY: 'your_actual_api_key',
    
    // Replace with your actual Mercuryo credentials
    MERCURYO_WIDGET_ID: 'your_actual_widget_id',
    MERCURYO_SIGN_KEY: 'your_actual_sign_key'
};
```

## 🎮 Usage

### Basic Flow

1. **Load the page** - The application automatically detects your region
2. **Verify region** - Ensures you're in a supported country (AU/CA/USA)
3. **Click "Buy Crypto"** - Generates a sample wallet address and copies it to clipboard
4. **Deep link opens** - SimpleSwap widget opens in a new tab with €19.50 pre-filled

### Testing Features

#### Regional Validation
- The app detects your location using IP geolocation
- Supported regions: Australia, Canada, USA
- US restrictions: Hawaii, Louisiana, New York are blocked

#### Wallet Address Generation
- Generates Bitcoin-compatible sample addresses
- Automatically copies address to clipboard on purchase
- Provides visual feedback when copy succeeds

#### Deep Link Construction
- Creates SimpleSwap widget URLs with pre-configured parameters
- Forces EUR to BTC conversion with €19.50 amount
- Includes partner ID for affiliate tracking

## 🧪 Testing

### Manual Testing Checklist

1. **Page Load**
   - [ ] Page loads within 3 seconds
   - [ ] €19.50 amount displays correctly
   - [ ] Mercuryo shows with green styling
   - [ ] No JavaScript errors in console

2. **Regional Validation**
   - [ ] App detects your country correctly
   - [ ] Shows appropriate access message
   - [ ] Handles unsupported regions gracefully

3. **Purchase Flow**
   - [ ] Click "Buy Crypto" button
   - [ ] Wallet address copied to clipboard
   - [ ] Button shows "✓ Address Copied!" feedback
   - [ ] SimpleSwap widget opens in new tab
   - [ ] URL contains correct parameters

4. **Mobile Testing**
   - [ ] Responsive design works on small screens
   - [ ] Touch interactions work properly
   - [ ] Clipboard copy functions on mobile

### Console Validation

Check browser console for proper logging:
```
Initializing SimpleSwap Checkout...
Regional validation result: {country: "US", isSupported: true, ...}
Generated sample wallet address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
SimpleSwap URL generated: https://simpleswap.io/widget/demo?...
Application initialized successfully
```

## 🚨 Known Limitations (Phase 1)

### Technical Limitations
- **Demo Addresses**: Generates sample wallet addresses only
- **Hardcoded Values**: €19.50 and EUR currency fixed
- **Basic Error Handling**: Console logging and simple messages
- **No Real API Calls**: Skeleton implementation for demonstration

### Functional Limitations
- **Payment Method Forcing**: URL-based approach only
- **Regional Detection**: Simple IP geolocation (may be inaccurate)
- **No Authentication**: Demo keys and IDs only
- **No Transaction Tracking**: No webhook or status monitoring

## 🔐 Security Considerations

### Current Implementation
- **Input Validation**: Basic address format validation
- **URL Safety**: Only opens whitelisted domains
- **Error Handling**: Graceful fallbacks for failed operations

### Production Requirements
- **HTTPS Required**: For clipboard API functionality
- **API Key Security**: Store credentials securely
- **Input Sanitization**: Validate all user inputs
- **CORS Configuration**: Proper cross-origin policies

## 🐛 Troubleshooting

### Common Issues

#### "Failed to copy address"
- **Cause**: Browser doesn't support Clipboard API
- **Solution**: Uses fallback method automatically
- **Note**: HTTPS required for modern clipboard API

#### "Service not available in your region"
- **Cause**: IP geolocation detected unsupported country
- **Solution**: Check supported regions (AU/CA/USA)
- **Workaround**: Use VPN for testing purposes

#### "Failed to open payment page"
- **Cause**: Popup blocker or browser security
- **Solution**: Allow popups for the site
- **Alternative**: Right-click and open link manually

## 📈 Performance

### Current Metrics
- **Load Time**: < 1 second on modern browsers
- **Bundle Size**: ~15KB total (HTML/CSS/JS combined)
- **Dependencies**: Zero external dependencies

### Optimization Notes
- **Embedded CSS**: Reduces HTTP requests
- **Modular JS**: Each component under 500 lines
- **Lazy Loading**: Not implemented (Phase 2 feature)

## 🚀 Next Steps (Phase 2)

### Planned Enhancements
- **Real API Integration**: Live SimpleSwap and Mercuryo APIs
- **Production Security**: Input validation, CSRF protection
- **Performance Optimization**: Bundle compression, caching
- **Enhanced Error Handling**: User-friendly messages, retry logic
- **Comprehensive Testing**: Unit tests, cross-browser validation

### Phase 2 Features
- **Real Wallet Integration**: Connect actual wallets
- **Transaction Tracking**: Webhook-based status updates
- **Advanced Regional Controls**: State-level restrictions
- **Production Monitoring**: Error tracking, analytics

## 📄 License

This project is part of the SimpleSwap Mercuryo integration demo.

## 🤝 Contributing

This is Phase 1 skeleton implementation. For production deployment, proceed to Phase 2 PRP.