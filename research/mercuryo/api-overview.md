# Mercuryo API Research Overview

## Regional Availability

### United States
- **Supported**: All states except Hawaii, Louisiana, New York
- **Verification**: ID cards and driver's licenses only (no passports)
- **Requirement**: Social Security Number (SSN) must be provided
- **Currency**: USD supported

### Canada
- **Provider**: MONEYMAPLE TECH LTD (BC1306168)
- **Regulation**: Registered with FINTRAC (MSB number M21565803)
- **Currency**: CAD supported
- **Services**: On-ramp and off-ramp, custody services

### Australia
- **Availability**: Off-ramp services (selling crypto)
- **Currency**: AUD supported
- **Payment**: Visa card withdrawals supported

## Widget Integration

### Core Requirements
- **Widget ID**: Obtained from Mercuryo dashboard
- **merchantTransactionId**: Unique ID for each transaction (max 255 characters)
- **Callback URL**: Required webhook endpoint (obligatory)
- **Signature**: HMAC SHA256 verification for security

### Widget Parameters
```javascript
let widgetParams = {
  widget_id: 'your_widget_id',
  merchantTransactionId: 'unique_transaction_id',
  address: 'blockchain_address',
  // Additional parameters
}
```

### URL Structure
```
https://sandbox-exchange.mrcr.io/?widget_id=your_widget_id&address=blockchain_address&merchant_transaction_id=unique_id
```

## API Endpoints

### Core Endpoints
- **GET /lib/currencies**: Get available currencies
- **POST /sdk-partner/sign-up**: User registration
- **POST /sdk-partner/login**: User authentication
- **GET /public/card-countries**: Get available countries
- **GET /public/data-by-ip**: Check user's location
- **GET /v1.6/public/rates**: Get exchange rates
- **GET /v1.6/widget/buy/rate**: Get buy rates
- **GET /v1.6/sdk-partner/transactions**: Transaction status

### Authentication
- **Sdk-Partner-Token**: Header required for API calls
- **widget_id**: Unique widget identifier
- **Signature verification**: HMAC SHA256 of request body

## Transaction Flow

### Buy Transactions
- **Statuses**: new, pending, cancelled, paid, order_scheduled
- **Process**: User selects amount → Payment → Crypto delivery

### Sell Transactions
- **Statuses**: new, pending, succeeded, failed
- **Process**: User sends crypto → Verification → Fiat withdrawal

## Webhook Configuration

### Setup Requirements
- **Callback URL**: Must be configured in dashboard
- **Signature**: X-Signature header with HMAC SHA256
- **Verification**: Hash of request body + sign key from dashboard

### Webhook Payload
```json
{
  "merchantTransactionId": "unique_id",
  "status": "paid",
  "amount": 100.00,
  "currency": "USD",
  "cryptoAmount": 0.002,
  "cryptoCurrency": "BTC"
}
```

## Rate Limiting
- **Recommended**: 1 request per 10 seconds
- **Whitelisting**: Production IP addresses must be whitelisted
- **Environment**: Sandbox available for testing

## Payment Methods
- **Cards**: Visa, Mastercard
- **Currencies**: USD, EUR, GBP, CAD, AUD, CHF, CZK, DKK, HKD
- **Regions**: 170+ countries (with restrictions)

## Mobile Integration

### iOS/Android Wrappers
- **iOS**: Mercuryo-Widget-Wrapper-iOS
- **Android**: Mercuryo-Widget-Wrapper-Android
- **Purpose**: WebView integration with correct parameters

### Implementation
```javascript
// WebView configuration
const webViewConfig = {
  url: 'https://exchange.mrcr.io/',
  parameters: {
    widget_id: 'your_widget_id',
    merchantTransactionId: 'unique_id',
    address: 'crypto_address'
  }
}
```

## Security Features

### Address Protection
- **Signature**: Use signature to protect crypto addresses
- **Format**: https://domain.io/?widget_id=id&address=address

### Transaction Security
- **Unique IDs**: Each transaction requires unique identifier
- **Webhook verification**: HMAC SHA256 signature verification
- **IP Whitelisting**: Production IPs must be whitelisted

## Error Handling
- **Standard HTTP codes**: 400, 401, 403, 404, 500
- **Error responses**: JSON format with error details
- **Retry logic**: Implement exponential backoff for failed requests

## Testing Environment
- **Sandbox URL**: https://sandbox-exchange.mrcr.io/
- **Test IPs**: Must be whitelisted for sandbox access
- **Test data**: Separate test widget_id for development