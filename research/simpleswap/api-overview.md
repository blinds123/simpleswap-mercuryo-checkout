# SimpleSwap API Research Overview

## API Base URL
- **Production**: https://api.simpleswap.io/
- **Documentation**: https://api.simpleswap.io/

## Key Features
- Supports 170+ countries
- 80+ cryptocurrencies (BTC, ETH, XMR, BNB, USDT, USDC, SOL, ADA, DOGE, etc.)
- Fiat currencies: EUR, USD, GBP
- Payment methods: Visa, Mastercard, Google Pay, SEPA
- Commission: 0.4% on finished exchanges
- 300,000+ trading pairs

## Core API Endpoints

### get_estimated
- **Purpose**: Calculate exchange amounts including network fees
- **Usage**: Helps users estimate total exchange value with market prices and network fees
- **Parameters**: currency_from, currency_to, amount, fixed (boolean)

### create_exchange
- **Purpose**: Create cryptocurrency exchanges
- **Method**: POST
- **Parameters**:
  - `fixed`: Boolean (true/false) - use fixed or floating rate
  - `currency_from`: Source cryptocurrency symbol (e.g., "btc")
  - `currency_to`: Destination cryptocurrency symbol (e.g., "eth")
  - `amount`: Amount to exchange
  - `address_to`: Destination wallet address
  - `extra_id_to`: Optional extra ID for destination
  - `user_refund_address`: Refund address for failures
  - `user_refund_extra_id`: Optional extra ID for refund

### Example cURL Request
```bash
curl -X 'POST' \
  'https://api.simpleswap.io/create_exchange?api_key=abcdef12-3456-7890-abcd-ef1234567890' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "fixed": true,
    "currency_from": "btc",
    "currency_to": "eth",
    "amount": 10,
    "address_to": "string",
    "extra_id_to": "",
    "user_refund_address": "string",
    "user_refund_extra_id": "string"
  }'
```

## Widget Deep Link Parameters

### Widget URL Structure
```
https://simpleswap.io/widget/demo?defaultCurrencyFrom="btc"&defaultCurrencyTo="eth"&currenciesListFrom=["btc"]&currenciesListTo=["eth"]&defaultPaymentAmount=0.1&colorTheme="white"&language="english"&partnerId="sample"
```

### Key Parameters
- `defaultCurrencyFrom`: Source currency
- `defaultCurrencyTo`: Target currency
- `currenciesListFrom`: Array of available source currencies
- `currenciesListTo`: Array of available target currencies
- `defaultPaymentAmount`: Pre-filled amount
- `colorTheme`: UI theme ("white" or "dark")
- `language`: Interface language
- `partnerId`: Affiliate partner identifier

## API Key Setup
1. Go to affiliate account at partners.simpleswap.io
2. Select "API" in Web Tools section
3. Click "Add New" to generate API key
4. Choose key type:
   - All exchange types
   - Fiat-to-crypto and crypto-to-fiat only
   - Crypto-to-crypto only

## Fiat Integration
- Redirects to partner site (Guardarian/Mercuryo)
- KYC required for fiat exchanges
- Minimum withdrawal: 300 USDT
- Total fiat commission: 4.95% (3.95% Mercuryo + 1% SimpleSwap)

## Rate Limiting
- Standard REST API rate limits apply
- No specific rate limit mentioned in documentation

## Error Handling
- Standard HTTP status codes
- Detailed error messages in JSON format
- Proper error handling for API failures required