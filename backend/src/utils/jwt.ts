import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'member';
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'ai-knowledge-copilot',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'ai-knowledge-copilot',
    }) as JWTPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
