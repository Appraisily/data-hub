const express = require('express');
const { google } = require('googleapis');
const { logError } = require('../utils/errorLogger');

function setupChatLogsRoutes(app, config) {
  const router = express.Router();

  // Middleware to verify shared secret
  const verifySharedSecret = async (req, res, next) => {
    const sharedSecret = req.headers['x-shared-secret'];
    
    try {
      const expectedSecret = await config.STRIPE_SHARED_SECRET;
      if (!sharedSecret || sharedSecret !== expectedSecret) {
        throw new Error('Invalid or missing shared secret');
      }
      next();
    } catch (error) {
      await logError(config, {
        timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        severity: 'Warning',
        scriptName: 'chatLogsRoutes',
        errorCode: 'AuthenticationError',
        errorMessage: 'Invalid or missing shared secret',
        endpoint: req.originalUrl,
        environment: 'Production',
        additionalContext: JSON.stringify({ 
          hasSharedSecret: !!sharedSecret,
          ip: req.ip 
        })
      });
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // GET /api/chat-logs
  router.get('/', verifySharedSecret, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Validate date parameters if provided
      if (startDate && !isValidISODate(startDate)) {
        return res.status(400).json({ error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2025-01-06T03:54:07.594Z)' });
      }
      if (endDate && !isValidISODate(endDate)) {
        return res.status(400).json({ error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2025-01-06T03:54:07.594Z)' });
      }

      // Initialize Google Sheets API
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      // Fetch data from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.MICHELLE_CHAT_LOGS_SPREADSHEET_ID,
        range: 'Chat!A:G', // Columns A through G
      });

      const rows = response.data.values || [];

      // Skip header row and process data
      const chatLogs = rows.slice(1).map(row => {
        try {
          return {
            timestamp: row[0],
            sessionId: row[1],
            userId: row[2],
            duration: parseInt(row[3], 10),
            messageCount: parseInt(row[4], 10),
            imageCount: parseInt(row[5], 10),
            messages: JSON.parse(row[6] || '[]')
          };
        } catch (error) {
          console.warn('Error parsing row:', error);
          return null;
        }
      }).filter(log => log !== null); // Remove any rows that failed to parse

      // Filter by date range if provided
      const filteredLogs = chatLogs.filter(log => {
        if (!startDate && !endDate) return true;
        
        const logDate = new Date(log.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        
        return logDate >= start && logDate <= end;
      });

      res.json({
        total: filteredLogs.length,
        logs: filteredLogs
      });

    } catch (error) {
      console.error('Error fetching chat logs:', error);
      
      await logError(config, {
        timestamp: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
        severity: 'Error',
        scriptName: 'chatLogsRoutes',
        errorCode: error.code || 'CHAT_LOGS_ERROR',
        errorMessage: error.message,
        stackTrace: error.stack,
        endpoint: req.originalUrl,
        environment: 'Production',
        additionalContext: JSON.stringify({ 
          query: req.query,
          error: error.response?.data || error.message
        })
      });

      res.status(500).json({ 
        error: 'Failed to fetch chat logs',
        details: error.message
      });
    }
  });

  // Mount the router
  app.use('/api/chat-logs', router);
}

function isValidISODate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.includes('T');
}

module.exports = {
  setupChatLogsRoutes
};