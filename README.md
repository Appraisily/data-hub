# Appraisily Data Hub

[Previous documentation remains the same...]

## API Endpoints

### Sheet Management

[Previous endpoints documentation remains the same...]

### Appraisal Management

#### `GET /api/appraisals/pending`
- Retrieves all pending appraisals
- Requires authentication
- Response:
  ```json
  {
    "appraisals": [
      {
        "date": "string",
        "serviceType": "string",
        "sessionId": "string",
        "customerEmail": "string",
        "customerName": "string",
        "appraisalStatus": "string",
        "appraisalEditLink": "string",
        "imageDescription": "string",
        "customerDescription": "string",
        "appraisalValue": "string",
        "appraisersDescription": "string",
        "finalDescription": "string",
        "pdfLink": "string",
        "docLink": "string",
        "imagesJson": "string"
      }
    ],
    "total": number
  }
  ```

[Rest of the documentation remains the same...]