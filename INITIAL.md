# SimpleSwap Mercuryo Checkout Landing Page

## Project Overview
Build a frictionless checkout landing page that integrates with SimpleSwap's API to create pre-configured deep links forcing Mercuryo as the payment method. The system must handle €19.50 pre-fills, wallet address copying, geo-restrictions, and graceful fallbacks.

## Core Requirements
- **Pre-fill amount**: €19.50 (fixed)
- **Force payment method**: Mercuryo (green highlight, not Moonpay)
- **Supported regions**: Australia, Canada, USA
- **Platform support**: Mobile and desktop responsive
- **Wallet interaction**: Copy address on "Buy" button click
- **Error handling**: Graceful fallbacks when Mercuryo unavailable
- **Logging**: Clear console logs for debugging

## Research Requirements (Ultraink Phase)
Research ONLY official documentation pages:

### SimpleSwap Documentation
- https://simpleswap.io - Main platform understanding
- https://simpleswap.io/api - API endpoints and parameters
- https://simpleswap.io/affiliate-program/en/help-center/article/fiat-api - Fiat integration specifics
- Additional SimpleSwap API docs as discovered

### Mercuryo Documentation  
- https://docs.mercuryo.io - Complete API reference
- Payment method selection mechanisms
- Regional availability endpoints
- Error handling best practices

### Research Process
1. **Deep scrape 30-100 pages** from official docs only
2. **Store in /research/** directory organized by technology
3. **Create llm.txt** summaries for each major component
4. **Validate all API endpoints** and parameters before implementation
5. **Document regional restrictions** and availability checks

## 3-Phase Development Structure

### Phase 1: Skeleton Implementation (phase-1.md)
- Basic HTML structure with responsive design
- SimpleSwap API integration foundation
- Mercuryo payment method selection logic
- Basic wallet address handling
- Console logging framework

### Phase 2: Production Ready (phase-2.md)
- Complete error handling and fallbacks
- Geo-restriction validation
- Mobile optimization
- Production-grade logging
- Performance optimizations
- Security validations

### Phase 3: Testing & Validation (phase-3.md)
- Comprehensive unit tests
- Cross-browser compatibility
- Mobile device testing
- Regional access testing
- Error scenario validation
- User flow testing

## Expected File Structure

```
/
├── index.html              # Main landing page
├── deepLinkBuilder.js      # SimpleSwap URL construction
├── walletHandler.js        # Wallet address management
├── geoRedirector.js        # Regional access control
├── styles.css              # Responsive styling
├── config.js               # Environment and API configuration
├── /research/              # Documentation research
│   ├── /simpleswap/        # SimpleSwap API docs
│   └── /mercuryo/          # Mercuryo integration docs
├── /tests/                 # Test suite
└── README.md               # Setup and usage instructions
```

## Technical Implementation Requirements

### Core Components
- **deepLinkBuilder.js**: Construct SimpleSwap URLs with Mercuryo forced
- **walletHandler.js**: Handle wallet address copying and validation
- **geoRedirector.js**: Validate regional access and redirect logic
- **Responsive Design**: Mobile-first approach with desktop optimization

### API Integration Specifications
- Use official SimpleSwap API endpoints only
- Implement proper error handling for API failures
- Cache responses where appropriate
- Validate all parameters before API calls

### User Experience Flow
1. User lands on page with €19.50 pre-filled
2. System validates user's region (AU/CA/USA)
3. Mercuryo appears highlighted (green) as payment method
4. User clicks "Buy" → wallet address copied to clipboard
5. Deep link opens SimpleSwap with Mercuryo pre-selected
6. Fallback to error page if Mercuryo unavailable

## Quality Standards
- **No hallucinated APIs**: All endpoints must be verified from official docs
- **Production-ready code**: Full error handling, logging, security
- **Cross-platform compatibility**: Mobile and desktop tested
- **Graceful degradation**: Clear error messages and fallbacks
- **Performance optimized**: Fast loading, minimal dependencies

## Success Criteria
- ✅ €19.50 pre-fills correctly
- ✅ Mercuryo shows as highlighted payment option
- ✅ Works in AU/CA/USA regions
- ✅ Wallet address copies on button click
- ✅ Mobile and desktop responsive
- ✅ Clear error handling and logging
- ✅ No fallback to Moonpay unless intended

## Development Notes
- Use Docker for all Python commands and testing
- Follow PEP8 and include type hints
- Create unit tests for all major functions
- Update TASK.md with progress tracking
- Never assume API behavior - validate with official docs