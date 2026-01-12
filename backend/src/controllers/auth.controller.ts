import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import type { AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.register({ email, password });

      res.status(201).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof Error && error.message === 'User already exists') {
        res.status(409).json({ error: 'Conflict', message: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.status(200).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ error: 'Unauthorized', message: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: 'Login failed' });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to get user' });
    }
  }
}

export const authController = new AuthController();
