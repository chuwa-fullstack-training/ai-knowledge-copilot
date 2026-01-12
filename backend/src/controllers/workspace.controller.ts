import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { workspaceService } from '../services/workspace.service';
import logger from '../config/logger';

export class WorkspaceController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { name } = req.body;

      const workspace = await workspaceService.create({
        name,
        userId: req.user.userId,
      });

      res.status(201).json({ workspace });
    } catch (error) {
      logger.error('Create workspace error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create workspace',
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID is required' });
        return;
      }

      const workspace = await workspaceService.getById(workspaceId);

      if (!workspace) {
        res.status(404).json({ error: 'Not Found', message: 'Workspace not found' });
        return;
      }

      res.status(200).json({ workspace });
    } catch (error) {
      logger.error('Get workspace error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get workspace',
      });
    }
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const workspaces = await workspaceService.getUserWorkspaces(req.user.userId);

      res.status(200).json({ workspaces });
    } catch (error) {
      logger.error('List workspaces error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list workspaces',
      });
    }
  }

  async inviteMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { workspaceId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID is required' });
        return;
      }

      const { userId: invitedUserId, role } = req.body;

      const workspace = await workspaceService.inviteMember({
        workspaceId,
        userId: req.user.userId,
        invitedUserId,
        role,
      });

      res.status(200).json({ workspace });
    } catch (error) {
      logger.error('Invite member error:', error);
      if (
        error instanceof Error &&
        (error.message === 'Only admins can invite members' ||
          error.message === 'User is already a member')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to invite member',
      });
    }
  }

  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { workspaceId, userId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId) || !userId || Array.isArray(userId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID and User ID are required' });
        return;
      }

      const workspace = await workspaceService.removeMember(
        workspaceId,
        req.user.userId,
        userId
      );

      res.status(200).json({ workspace });
    } catch (error) {
      logger.error('Remove member error:', error);
      if (
        error instanceof Error &&
        (error.message === 'Only admins can remove members' ||
          error.message === 'Cannot remove the last admin')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to remove member',
      });
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { workspaceId, userId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId) || !userId || Array.isArray(userId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID and User ID are required' });
        return;
      }

      const { role } = req.body;

      const workspace = await workspaceService.updateMemberRole({
        workspaceId,
        userId: req.user.userId,
        targetUserId: userId,
        newRole: role,
      });

      res.status(200).json({ workspace });
    } catch (error) {
      logger.error('Update member role error:', error);
      if (
        error instanceof Error &&
        (error.message === 'Only admins can update member roles' ||
          error.message === 'Cannot demote the last admin')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update member role',
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { workspaceId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID is required' });
        return;
      }

      await workspaceService.delete(workspaceId, req.user.userId);

      res.status(204).send();
    } catch (error) {
      logger.error('Delete workspace error:', error);
      if (error instanceof Error && error.message === 'Only admins can delete workspaces') {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete workspace',
      });
    }
  }
}

export const workspaceController = new WorkspaceController();
