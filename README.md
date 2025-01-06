# Appraisily Data Hub

<<<<<<< HEAD
A Node.js service that handles Stripe payments, processes art appraisal submissions, and manages the workflow between payment processing and WordPress content creation.

## Architecture Overview

The service consists of three main components:
1. Payment Processing (Stripe webhooks and session management)
2. Appraisal Submission Processing (image handling and WordPress integration)
3. Background Processing (image optimization and notifications)
=======
A centralized data management service for Appraisily, providing secure access to various data sources including Google Sheets, WordPress, and analytics data.
>>>>>>> parent of 762c98c (ssa)

## Features

<<<<<<< HEAD
```
├── src/
│   ├── routes/
│   │   ├── appraisalRoutes.js    # Handles appraisal submission endpoints
│   │   ├── stripeRoutes.js       # Handles Stripe-related endpoints
│   │   └── webhookRoutes.js      # Manages Stripe webhook endpoints
│   ├── services/
│   │   ├── appraisalProcessor.js # Processes appraisal submissions
│   │   ├── backgroundProcessor.js # Handles async image processing
│   │   ├── checkoutProcessor.js  # Processes Stripe checkout sessions
│   │   └── webhookHandler.js     # Manages webhook event processing
│   ├── utils/
│   │   ├── emailService.js       # SendGrid email functionality
│   │   ├── errorLogger.js        # Google Sheets error logging
│   │   ├── imageProcessor.js     # Sharp image optimization
│   │   ├── validators.js         # Request validation
│   │   └── wordPressClient.js    # WordPress API integration
│   ├── config.js                 # Configuration management
│   └── index.js                  # Application entry point
├── Dockerfile                    # Container configuration
└── package.json                  # Project dependencies
```

## API Endpoints

### Stripe Webhooks

#### POST `/stripe-webhook`
Handles live mode Stripe webhook events.

#### POST `/stripe-webhook-test`
Handles test mode Stripe webhook events.
=======
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
>>>>>>> parent of 762c98c (ssa)

**Authentication Required**: No

<<<<<<< HEAD
### Stripe Session

#### GET `/stripe/session/:sessionId`
Retrieves session information.

**Headers Required:**
- `x-shared-secret`: Shared secret for authentication

### Appraisal Submission

#### POST `/api/appraisals`
Handles appraisal submissions with image uploads.

**Headers Required:**
- Content-Type: multipart/form-data

**Form Fields:**
- `session_id`: Stripe session ID
- `customer_email`: Customer's email
- `customer_name`: Customer's name (optional)
- `description`: Appraisal description (optional)

**File Fields:**
- `main`: Main image (required)
- `signature`: Signature image (optional)
- `age`: Age verification image (optional)
=======
**Example Request**:
```bash
curl -X GET 'https://data-hub-856401495068.us-central1.run.app/api/endpoints'
```

**Response**: Returns a detailed documentation object containing:
- List of all available endpoints
- Authentication requirements
- Rate limiting information
- Example requests and responses

### `GET /api/process`
Retrieves information about the appraisal request process and customer journey.

**Authentication Required**: Yes (API Key)

**Example Request**:
```bash
curl -X GET \
  'https://data-hub-856401495068.us-central1.run.app/api/process' \
  -H 'X-API-Key: your_api_key_here'
```

**Response**:
```json
{
  "customerJourney": {
    "startUrl": "appraisily.com/start",
    "steps": [
      "Select desired appraisal service (Regular, Insurance, or Tax)",
      "Choose preferred date for the appraisal",
      "Click 'Continue to Checkout'"
    ]
  },
  "paymentProcess": {
    "steps": [
      "Redirected to Stripe checkout",
      "Complete payment securely",
      "Automatic redirect to success page"
    ]
  },
  "appraisalDetails": {
    "successPageFormat": "appraisily.com/success-payment/?session_id={sessionID}",
    "requiredInformation": [
      "Images of item(s)",
      "Description and details",
      "Additional relevant information"
    ]
  },
  "serviceDelivery": {
    "process": [
      "Appraisal process begins after details submission",
      "Expert assigned based on service type",
      "Completed within specified timeframe (usually 48 hours)"
    ]
  }
}
```

### `GET /api/appraisals/pending`
Retrieves all pending appraisals from the system.
>>>>>>> parent of 762c98c (ssa)

**Authentication Required**: Yes (API Key)

**Query Parameters**:
- `email` (optional): Filter by customer email
- `sessionId` (optional): Filter by session ID (custom order ID)
- `wordpressSlug` (optional): Filter by WordPress URL slug

<<<<<<< HEAD
### Stripe Configuration
```
STRIPE_SECRET_KEY_TEST           # Stripe test environment API key
STRIPE_SECRET_KEY_LIVE          # Stripe live environment API key
STRIPE_WEBHOOK_SECRET_TEST      # Stripe test webhook signing secret
STRIPE_WEBHOOK_SECRET_LIVE      # Stripe live webhook signing secret
STRIPE_SHARED_SECRET           # Shared secret for internal API authentication
```

### Google Sheets Configuration
```
SALES_SPREADSHEET_ID           # Google Sheet ID for sales records
PENDING_APPRAISALS_SPREADSHEET_ID # Google Sheet ID for pending appraisals
LOG_SPREADSHEET_ID             # Google Sheet ID for error logs
```

### SendGrid Configuration
```
SENDGRID_API_KEY              # SendGrid API key
SENDGRID_EMAIL                # Verified sender email for SendGrid
SEND_GRID_TEMPLATE_NOTIFY_PAYMENT_RECEIVED # SendGrid template ID
```

### WordPress Configuration
```
WORDPRESS_API_URL             # WordPress REST API URL
wp_username                   # WordPress username
wp_app_password              # WordPress application password
ADMIN_EMAIL                  # Admin notification email
```

## Google Sheets Structure

### Sales Sheet
Columns:
- A: Session ID
- B: Payment Intent ID
- C: Customer ID
- D: Customer Name
- E: Customer Email
- F: Amount Paid
- G: Session Date
- H: Mode (Test/Live)

### Pending Appraisals Sheet
Columns:
- A: Date
- B: Appraisal Type
- C: Session ID
- D: Customer Email
- E: Customer Name
- F: Status

### Error Log Sheet
Columns:
- Timestamp
- Severity
- Script Name
- Error Code
- Error Message
- Stack Trace
- User ID
- Request ID
- Environment
- Endpoint
- Additional Context
- Resolution Status
- Assigned To
- ChatGPT Link
- Resolution Link

## Product Types

The service handles different types of art appraisals:
=======
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
>>>>>>> parent of 762c98c (ssa)
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

<<<<<<< HEAD
Optional environment variables with their defaults:
```
PORT                    # Server port (default: 8080)
GOOGLE_CLOUD_PROJECT_ID # Google Cloud project ID
CHATGPT_CHAT_URL       # Support chat URL (default: provided URL)
RESOLUTION_LINK        # Issue resolution link (default: provided URL)
ASSIGNED_TO            # Default assignee for issues (default: "Your Name")
```

## Features

### Payment Processing
- Handles Stripe webhook events
- Processes checkout session completions
- Records transactions in Google Sheets
- Sends confirmation emails via SendGrid

### Image Processing
- Optimizes uploaded images using Sharp
- Converts images to JPEG format
- Resizes large images while maintaining aspect ratio
- Removes EXIF data for privacy
- Maximum file size: 10MB per image

### WordPress Integration
- Creates custom post type 'appraisals'
- Handles media uploads
- Updates posts with ACF fields
- Manages featured images

### Error Handling
- Comprehensive error logging to Google Sheets
- Detailed error context and stack traces
- Error severity classification
- Resolution tracking

### Security
- Webhook signature verification
- Shared secret authentication for internal APIs
- Basic authentication for WordPress API
- File type validation
- Size limit enforcement

## Running the Service

### Local Development
=======
**Authentication Required**: Yes (API Key)

**Query Parameters**: Same as `/api/appraisals/pending`

**Example Request**:
>>>>>>> parent of 762c98c (ssa)
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

<<<<<<< HEAD
### Docker Deployment
```bash
# Build the container
docker build -t payment-processor .

# Run the container
docker run -p 8080:8080 payment-processor
```

### Environment Setup
1. Configure all required secrets in Google Cloud Secret Manager
2. Set up Google Cloud authentication
3. Configure WordPress custom post type and ACF fields
4. Set up SendGrid email templates
5. Configure Stripe webhooks

## Error Handling

The service implements comprehensive error handling:
1. Logs all errors to Google Sheets
2. Sends notifications for critical errors
3. Maintains error context for debugging
4. Tracks resolution status
5. Provides links to relevant resources

## Dependencies

Major dependencies and their purposes:
- `express`: Web server framework
- `@google-cloud/secret-manager`: Secrets management
- `googleapis`: Google Sheets integration
- `stripe`: Payment processing
- `@sendgrid/mail`: Email notifications
- `sharp`: Image optimization
- `multer`: File upload handling
- `axios`: HTTP client
- `form-data`: Multipart form handling
=======
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
>>>>>>> parent of 762c98c (ssa)
