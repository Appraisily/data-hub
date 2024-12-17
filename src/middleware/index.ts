import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';

export const setupMiddleware = (app: Express) => {
  // CORS middleware
  app.use(cors({
    origin: ['https://incredible-truffle-ee0b8c.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    maxAge: 86400 // 24 hours
  }));

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  
  // Apply rate limiter to all routes
  app.use(limiter);

  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};