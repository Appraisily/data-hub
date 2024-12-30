# Payment Processor Service

A Node.js service that handles Stripe payments, processes art appraisal submissions, and manages the workflow between payment processing and WordPress content creation.

## Architecture Overview

The service consists of three main components:
1. Payment Processing (Stripe webhooks and session management)
2. Appraisal Submission Processing (image handling and WordPress integration)
3. Background Processing (image optimization and notifications)

## File Structure

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

**Headers Required:**
- `stripe-signature`: Webhook signature from Stripe

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

## Required Secrets

Configure the following secrets in Google Cloud Secret Manager:

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
```json
{
  "plink_1PzzahAQSJ9n5XyNZTMmYyLJ": { "productName": "RegularArt" },
  "plink_1OnRh5AQSJ9n5XyNBhDuqbtS": { "productName": "RegularArt" },
  "plink_1OnRpsAQSJ9n5XyN2BCtWNEs": { "productName": "InsuranceArt" },
  "plink_1OnRzAAQSJ9n5XyNyLmReeCk": { "productName": "TaxArt" }
}
```

## Environment Variables

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
```bash
# Install dependencies
npm install

# Start the service
npm start
```

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