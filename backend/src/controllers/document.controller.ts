import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { documentService } from '../services/document.service';
import { storageService } from '../services/storage.service';
import logger from '../config/logger';

export class DocumentController {
  /**
   * Upload document to workspace
   */
  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Bad Request', message: 'No file uploaded' });
        return;
      }

      const { workspaceId } = req.params;
      if (!workspaceId || Array.isArray(workspaceId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Workspace ID is required' });
        return;
      }

      const { title } = req.body;

      const document = await documentService.create({
        workspaceId,
        userId: req.user.userId,
        file: req.file,
        title,
      });

      res.status(201).json({ document });
    } catch (error) {
      logger.error('Upload document error:', error);

      // Clean up uploaded file on error
      if (req.file) {
        try {
          await storageService.deleteFile(req.file.path);
        } catch (cleanupError) {
          logger.error('Failed to cleanup file after error:', cleanupError);
        }
      }

      if (error instanceof Error && error.message === 'User is not a member of this workspace') {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload document',
      });
    }
  }

  /**
   * Get document by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { documentId } = req.params;
      if (!documentId || Array.isArray(documentId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Document ID is required' });
        return;
      }

      const document = await documentService.getById(documentId, req.user.userId);

      if (!document) {
        res.status(404).json({ error: 'Not Found', message: 'Document not found' });
        return;
      }

      res.status(200).json({ document });
    } catch (error) {
      logger.error('Get document error:', error);

      if (error instanceof Error && error.message.includes('Access denied')) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get document',
      });
    }
  }

  /**
   * List documents in workspace
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
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

      const { status, limit, offset } = req.query;

      const result = await documentService.list({
        workspaceId,
        userId: req.user.userId,
        status: status as any,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('List documents error:', error);

      if (error instanceof Error && error.message === 'User is not a member of this workspace') {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list documents',
      });
    }
  }

  /**
   * Update document status
   */
  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { documentId } = req.params;
      if (!documentId || Array.isArray(documentId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Document ID is required' });
        return;
      }

      const { status, errorMessage } = req.body;

      // Verify user has access to the document
      const existingDoc = await documentService.getById(documentId, req.user.userId);
      if (!existingDoc) {
        res.status(404).json({ error: 'Not Found', message: 'Document not found' });
        return;
      }

      const document = await documentService.updateStatus({
        documentId,
        status,
        errorMessage,
      });

      res.status(200).json({ document });
    } catch (error) {
      logger.error('Update document status error:', error);

      if (error instanceof Error && error.message.includes('Access denied')) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update document status',
      });
    }
  }

  /**
   * Delete document
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No user found' });
        return;
      }

      const { documentId } = req.params;
      if (!documentId || Array.isArray(documentId)) {
        res.status(400).json({ error: 'Bad Request', message: 'Document ID is required' });
        return;
      }

      await documentService.delete(documentId, req.user.userId);

      res.status(204).send();
    } catch (error) {
      logger.error('Delete document error:', error);

      if (error instanceof Error && error.message.includes('Access denied')) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      if (error instanceof Error && error.message === 'Document not found') {
        res.status(404).json({ error: 'Not Found', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete document',
      });
    }
  }

  /**
   * Get workspace document statistics
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
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

      const stats = await documentService.getWorkspaceStats(workspaceId, req.user.userId);

      res.status(200).json({ stats });
    } catch (error) {
      logger.error('Get workspace stats error:', error);

      if (error instanceof Error && error.message === 'User is not a member of this workspace') {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get workspace statistics',
      });
    }
  }
}

export const documentController = new DocumentController();
