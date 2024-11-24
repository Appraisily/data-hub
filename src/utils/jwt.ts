import jwt from 'jsonwebtoken';
import { logger } from './logger';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JWTUtil {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || '';
  private static readonly TOKEN_EXPIRY = '24h';

  static generateToken(payload: TokenPayload): string {
    try {
      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.TOKEN_EXPIRY
      });
    } catch (error) {
      logger.error('Error generating JWT:', error);
      throw new Error('Failed to generate token');
    }
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      logger.error('Error verifying JWT:', error);
      throw new Error('Invalid token');
    }
  }
}