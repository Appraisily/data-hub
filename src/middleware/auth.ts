import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  authenticated?: boolean;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new Error('Invalid API key');
    }

    req.authenticated = true;
    next();
  } catch (error) {
    logger.warn('Authentication failed:', error);
    res.status(401).json({ error: 'Invalid API key' });
  }
};