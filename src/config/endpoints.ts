import { z } from 'zod';

export interface EndpointParam {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface EndpointDoc {
  path: string;
  method: string;
  description: string;
  authentication: boolean;
  parameters?: EndpointParam[];
  responseExample: any;
}

export const endpoints: EndpointDoc[] = [
  {
    path: '/api/appraisals/pending',
    method: 'GET',
    description: 'Retrieves pending appraisals with optional filters',
    authentication: true,
    parameters: [
      {
        name: 'email',
        type: 'string',
        description: 'Filter by customer email',
        required: false
      },
      {
        name: 'sessionId',
        type: 'string',
        description: 'Filter by session ID (custom order ID)',
        required: false
      },
      {
        name: 'wordpressSlug',
        type: 'string',
        description: 'Filter by WordPress URL slug',
        required: false
      }
    ],
    responseExample: {
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
  },
  {
    path: '/api/appraisals/completed',
    method: 'GET',
    description: 'Retrieves completed appraisals with optional filters',
    authentication: true,
    parameters: [
      {
        name: 'email',
        type: 'string',
        description: 'Filter by customer email',
        required: false
      },
      {
        name: 'sessionId',
        type: 'string',
        description: 'Filter by session ID (custom order ID)',
        required: false
      },
      {
        name: 'wordpressSlug',
        type: 'string',
        description: 'Filter by WordPress URL slug',
        required: false
      }
    ],
    responseExample: {
      "appraisals": [
        {
          "date": "2024-03-10",
          "serviceType": "Standard",
          "sessionId": "abc123",
          "customerEmail": "customer@example.com",
          "customerName": "John Doe",
          "appraisalStatus": "Completed",
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
  },
  {
    path: '/api/sales',
    method: 'GET',
    description: 'Retrieves sales data with optional filters',
    authentication: true,
    parameters: [
      {
        name: 'email',
        type: 'string',
        description: 'Filter by customer email',
        required: false
      },
      {
        name: 'sessionId',
        type: 'string',
        description: 'Filter by session ID',
        required: false
      },
      {
        name: 'stripeCustomerId',
        type: 'string',
        description: 'Filter by Stripe customer ID',
        required: false
      }
    ],
    responseExample: {
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
  }
];