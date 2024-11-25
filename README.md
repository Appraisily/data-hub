# Appraisily Data Hub

A centralized data management service for Appraisily, providing secure access to various data sources including Google Sheets, WordPress, and analytics data.

## Features

- Secure API access with API key authentication
- Google Sheets integration for appraisal data
- Caching system for improved performance
- Comprehensive error handling and logging
- Rate limiting for API protection

## Current API Status

**Note**: Currently, only the appraisals and sales endpoints are active. Additional endpoints for WordPress integration, analytics, and other features will be activated in future updates.

## Authentication

All endpoints require authentication using an API key. Include the API key in the request headers:

```bash
X-API-Key: your_api_key_here
```

## Active Endpoints

### `GET /api/appraisals/pending`
Retrieves all pending appraisals from the system.

**Authentication Required**: Yes (API Key)

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `email` (optional): Filter by customer email
- `sessionId` (optional): Filter by session ID (custom order ID)
- `wordpressSlug` (optional): Filter by WordPress URL slug

**Example Requests**:
```bash
# Get all pending appraisals
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/pending' \
  -H 'X-API-Key: your_api_key_here'

# Filter by email
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/pending?email=customer@example.com' \
  -H 'X-API-Key: your_api_key_here'

# Filter by session ID
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/pending?sessionId=abc123' \
  -H 'X-API-Key: your_api_key_here'
```

### `GET /api/appraisals/completed`
Retrieves all completed appraisals from the system.

**Authentication Required**: Yes (API Key)

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `email` (optional): Filter by customer email
- `sessionId` (optional): Filter by session ID (custom order ID)
- `wordpressSlug` (optional): Filter by WordPress URL slug

### `GET /api/sales`
Retrieves sales data from the system.

**Authentication Required**: Yes (API Key)

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `email` (optional): Filter by customer email
- `sessionId` (optional): Filter by session ID
- `stripeCustomerId` (optional): Filter by Stripe customer ID

**Example Requests**:
```bash
# Get all sales
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/sales' \
  -H 'X-API-Key: your_api_key_here'

# Filter by email
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/sales?email=customer@example.com' \
  -H 'X-API-Key: your_api_key_here'

# Filter by session ID
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/sales?sessionId=abc123' \
  -H 'X-API-Key: your_api_key_here'

# Filter by Stripe customer ID
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/sales?stripeCustomerId=cus_xxx' \
  -H 'X-API-Key: your_api_key_here'

# Filter by multiple parameters
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/sales?email=customer@example.com&sessionId=abc123' \
  -H 'X-API-Key: your_api_key_here'
```

**Response**:
```json
{
  "sales": [
    {
      "sessionId": "abc123",
      "chargeId": "ch_xxx",
      "stripeCustomerId": "cus_xxx",
      "customerName": "John Doe",
      "customerEmail": "customer@example.com",
      "amount": "$100.00",
      "date": "2024-03-10"
    }
  ],
  "total": 1
}
```

### Planned Endpoints (Coming Soon)

The following endpoints are planned for future releases:
- WordPress content synchronization
- Analytics data retrieval
- Chat logs integration

## Error Responses

All endpoints follow a standard error response format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized (Invalid API Key)
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to protect against abuse:
- 100 requests per 15 minutes per IP address
- After exceeding the limit, requests will receive a 429 (Too Many Requests) response

## Development

### Prerequisites
- Node.js >= 20.0.0
- Google Cloud project with necessary APIs enabled
- Access to Google Secret Manager

### Required Environment Variables
The following secrets must be configured in Google Secret Manager:
- `DATA_HUB_API_KEY`: API key for authentication
- `PENDING_APPRAISALS_SPREADSHEET_ID`: Google Sheets ID for pending appraisals
- `GOOGLE_DOCS_CREDENTIALS`: Service account credentials for Google Docs API
- `SALES_SPREADSHEET_ID`: Google Sheets ID for sales data

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Build Process
1. The Dockerfile uses Node.js 20 slim image
2. Dependencies are installed using `npm ci`
3. TypeScript code is compiled to JavaScript
4. Application runs on port 8080

### Environment Configuration
All sensitive configuration is managed through Google Secret Manager and automatically loaded during deployment.

## Deployment

The service is deployed on Google Cloud Run. Deployments are handled automatically through Cloud Build triggers.

Current production URL: `https://data-hub-856401495068.us-central1.run.app`