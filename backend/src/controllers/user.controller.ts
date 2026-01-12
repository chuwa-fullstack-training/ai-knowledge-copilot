import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import logger from '../config/logger';

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const user = await userService.getProfile(req.user.userId);

      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get profile',
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const user = await userService.updateProfile(req.user.userId, req.body);

      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      logger.error('Update profile error:', error);
      if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({
          error: 'Validation Error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }

  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const deleted = await userService.deleteAccount(req.user.userId);

      if (!deleted) {
        res.status(404).json({ error: 'Not Found', message: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete account',
      });
    }
  }
}

export const userController = new UserController();
