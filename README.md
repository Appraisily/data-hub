# Appraisily Data Hub

A centralized data management service for Appraisily, providing secure access to various data sources including Google Sheets, WordPress, and analytics data.

## Features

- Secure API access with API key authentication
- Google Sheets integration for appraisal and sales data
- Automatic documentation endpoint
- Caching system for improved performance
- Comprehensive error handling and logging
- Rate limiting for API protection
- Query parameter filtering for all endpoints

## Authentication

All endpoints (except `/api/endpoints`) require authentication using an API key. Include the API key in the request headers:

```bash
X-API-Key: your_api_key_here
```

## API Documentation

### `GET /api/endpoints`
Retrieves comprehensive API documentation including all available endpoints, their parameters, and example responses.

**Authentication Required**: No

**Example Request**:
```bash
curl -X GET 'https://data-hub-856401495068.us-central1.run.app/api/endpoints'
```

**Response**: Returns a detailed documentation object containing:
- List of all available endpoints
- Authentication requirements
- Rate limiting information
- Example requests and responses

### `GET /api/appraisals/pending`
Retrieves all pending appraisals from the system.

**Authentication Required**: Yes (API Key)

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

# Filter by multiple parameters
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/pending?email=customer@example.com&sessionId=abc123' \
  -H 'X-API-Key: your_api_key_here'
```

**Response**:
```json
{
  "appraisals": [
    {
      "date": "2024-03-10",
      "serviceType": "Standard",
      "sessionId": "abc123",
      "customerEmail": "customer@example.com",
      "customerName": "John Doe",
      "appraisalStatus": "Pending",
      "appraisalEditLink": "https://...",
      "imageDescription": "Vintage watch",
      "customerDescription": "Family heirloom",
      "appraisalValue": "$1000",
      "appraisersDescription": "1950s Omega",
      "finalDescription": "Mid-century timepiece",
      "pdfLink": "https://...",
      "docLink": "https://...",
      "imagesJson": "{}",
      "wordpressSlug": "vintage-watch-appraisal"
    }
  ],
  "total": 1
}
```

### `GET /api/appraisals/completed`
Retrieves all completed appraisals from the system.

**Authentication Required**: Yes (API Key)

**Query Parameters**: Same as `/api/appraisals/pending`

**Example Request**:
```bash
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/completed' \
  -H 'X-API-Key: your_api_key_here'
```

### `GET /api/sales`
Retrieves sales data from the system.

**Authentication Required**: Yes (API Key)

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

## Error Responses

All endpoints follow a standard error response format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (Invalid parameters)
- 401: Unauthorized (Invalid API Key)
- 429: Too Many Requests (Rate limit exceeded)
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting to protect against abuse:
- 100 requests per 15 minutes per IP address
- After exceeding the limit, requests will receive a 429 (Too Many Requests) response

## Caching

The API implements a caching system to improve performance:
- Cache duration: 5 minutes
- Separate caches for different query parameters
- Automatic cache invalidation on data updates

## Development

### Prerequisites
- Node.js >= 20.0.0
- Google Cloud project with necessary APIs enabled
- Access to Google Secret Manager

### Required Environment Variables
The following secrets must be configured in Google Secret Manager:
- `DATA_HUB_API_KEY`: API key for authentication
- `PENDING_APPRAISALS_SPREADSHEET_ID`: Google Sheets ID for pending appraisals
- `SALES_SPREADSHEET_ID`: Google Sheets ID for sales data
- `GOOGLE_DOCS_CREDENTIALS`: Service account credentials for Google Docs API

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