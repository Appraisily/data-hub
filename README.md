# Appraisily Data Hub

A centralized data management service for Appraisily, providing secure access to various data sources including Google Sheets, WordPress, and analytics data.

## Features

- Secure API access with API key authentication
- Google Sheets integration for appraisal data
- Caching system for improved performance
- Comprehensive error handling and logging
- Rate limiting for API protection

## Authentication

All endpoints require authentication using an API key. Include the API key in the request headers:

```bash
X-API-Key: your_api_key_here
```

## API Endpoints

### Appraisal Management

#### `GET /api/appraisals/pending`
Retrieves all pending appraisals from the system.

**Authentication Required**: Yes (API Key)

**Headers**:
```
X-API-Key: your_api_key_here
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
      "imagesJson": "{...}"
    }
  ],
  "total": 1
}
```

**Example Request**:
```bash
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/appraisals/pending' \
  -H 'X-API-Key: your_api_key_here'
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

### Environment Variables
Required secrets in Google Secret Manager:
- `DATA_HUB_API_KEY`: API key for authentication
- `PENDING_APPRAISALS_SPREADSHEET_ID`: Google Sheets ID for pending appraisals

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

## Deployment

The service is deployed on Google Cloud Run. Deployments are handled automatically through Cloud Build triggers.

Current production URL: `https://data-hub-856401495068.us-central1.run.app`