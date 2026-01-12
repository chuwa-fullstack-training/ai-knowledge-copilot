import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { workspaceService } from '../services/workspace.service';
import logger from '../config/logger';

export interface WorkspaceRequest extends AuthRequest {
  workspaceRole?: 'admin' | 'member';
}

export function checkWorkspaceAccess(requiredRole?: 'admin') {
  return async (
    req: WorkspaceRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const workspaceId = req.params.workspaceId;
      if (!workspaceId) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID required' });
        return;
      }

      // Check membership
      const memberRole = await workspaceService.checkMembership(
        workspaceId,
        req.user.userId
      );

      if (!memberRole) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You are not a member of this workspace',
        });
        return;
      }

      // Check role requirement
      if (requiredRole === 'admin' && memberRole !== 'admin') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'This action requires admin role',
        });
        return;
      }

      req.workspaceRole = memberRole;
      next();
    } catch (error) {
      logger.error('Workspace authorization error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authorization check failed',
      });
    }
  };
}
