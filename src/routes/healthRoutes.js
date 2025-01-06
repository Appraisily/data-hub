const express = require('express');
const { google } = require('googleapis');
const sendGridMail = require('@sendgrid/mail');
const stripeModule = require('stripe');

function setupHealthRoutes(app, config) {
  const router = express.Router();

  // GET /api/health/endpoints
  router.get('/endpoints', (req, res) => {
    res.json({
      service: 'payment-processor',
      version: '1.0.0',
      endpoints: [
        {
          path: '/stripe-webhook',
          method: 'POST',
          description: 'Handles Stripe webhook events for live mode',
          requiredParams: ['stripe-signature'],
          response: { status: 'OK' }
        },
        {
          path: '/stripe-webhook-test',
          method: 'POST',
          description: 'Handles Stripe webhook events for test mode',
          requiredParams: ['stripe-signature'],
          response: { status: 'OK' }
        },
        {
          path: '/stripe/session/:sessionId',
          method: 'GET',
          description: 'Retrieves Stripe session information',
          requiredParams: ['x-shared-secret'],
          response: {
            customer_details: {
              name: 'string',
              email: 'string'
            },
            amount_total: 'number',
            currency: 'string',
            payment_status: 'string'
          }
        },
        {
          path: '/api/appraisals',
          method: 'POST',
          description: 'Handles appraisal submissions with image uploads',
          requiredParams: ['session_id', 'customer_email', 'main'],
          response: {
            success: 'boolean',
            post_id: 'number',
            post_url: 'string'
          }
        },
        {
          path: '/api/chat-logs',
          method: 'GET',
          description: 'Retrieves chat logs with optional date filtering',
          requiredParams: ['x-shared-secret'],
          response: {
            total: 'number',
            logs: 'array'
          }
        }
      ]
    });
  });

  // GET /api/health/status
  router.get('/status', async (req, res) => {
    try {
      const checks = await performHealthChecks(config);
      const allHealthy = Object.values(checks.services).every(status => status === true);

      res.json({
        status: allHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: checks.services
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          database: false,
          cache: false,
          wordpress: false,
          sheets: false,
          email: false
        },
        error: error.message
      });
    }
  });

  // Mount the router
  app.use('/api/health', router);
}

async function performHealthChecks(config) {
  const checks = {
    services: {
      sheets: false,
      email: false,
      stripe: false,
      wordpress: false
    }
  };

  try {
    // Check Google Sheets
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    await auth.getClient();
    checks.services.sheets = true;
  } catch (error) {
    console.error('Sheets health check failed:', error);
  }

  try {
    // Check SendGrid
    sendGridMail.setApiKey(config.SENDGRID_API_KEY);
    await sendGridMail.send({
      to: 'test@example.com',
      from: config.EMAIL_SENDER,
      subject: 'Health Check',
      text: 'Health Check',
      mailSettings: {
        sandboxMode: {
          enable: true
        }
      }
    });
    checks.services.email = true;
  } catch (error) {
    console.error('Email health check failed:', error);
  }

  try {
    // Check Stripe
    const stripe = stripeModule(config.STRIPE_SECRET_KEY_LIVE);
    await stripe.balance.retrieve();
    checks.services.stripe = true;
  } catch (error) {
    console.error('Stripe health check failed:', error);
  }

  try {
    // Check WordPress
    const response = await fetch(`${config.WORDPRESS_API_URL}/wp/v2`, {
      method: 'HEAD',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.WORDPRESS_USERNAME}:${config.WORDPRESS_APP_PASSWORD}`).toString('base64')}`
      }
    });
    checks.services.wordpress = response.ok;
  } catch (error) {
    console.error('WordPress health check failed:', error);
  }

  return checks;
}

module.exports = {
  setupHealthRoutes
};