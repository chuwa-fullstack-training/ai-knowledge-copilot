import mongoose from 'mongoose';
import { DocumentModel, type IDocument, type DocumentStatus } from '../models/Document';
import { storageService } from './storage.service';
import { workspaceService } from './workspace.service';
import logger from '../config/logger';

export interface CreateDocumentData {
  workspaceId: string;
  userId: string;
  file: Express.Multer.File;
  title?: string;
}

export interface ListDocumentsQuery {
  workspaceId: string;
  userId: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export interface UpdateDocumentStatusData {
  documentId: string;
  status: DocumentStatus;
  errorMessage?: string;
}

export class DocumentService {
  /**
   * Create document record after file upload
   */
  async create(data: CreateDocumentData): Promise<IDocument> {
    const { workspaceId, userId, file, title } = data;

    // Verify workspace membership
    const membership = await workspaceService.checkMembership(workspaceId, userId);
    if (!membership) {
      throw new Error('User is not a member of this workspace');
    }

    // Get file metadata
    const metadata = await storageService.getFileMetadata(file);

    // Create document record
    const document = await DocumentModel.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      title: title || file.originalname,
      originalName: file.originalname,
      fileName: metadata.fileName,
      filePath: metadata.filePath,
      mimeType: metadata.mimeType,
      size: metadata.size,
      status: 'uploaded',
      uploadedBy: new mongoose.Types.ObjectId(userId),
    });

    logger.info(`Document created: ${document._id} in workspace ${workspaceId}`);

    return document;
  }

  /**
   * Get document by ID with workspace validation
   */
  async getById(documentId: string, userId: string): Promise<IDocument | null> {
    const document = await DocumentModel.findById(documentId)
      .populate('uploadedBy', 'email userName')
      .populate('workspaceId', 'name');

    if (!document) {
      return null;
    }

    // Verify workspace membership
    const membership = await workspaceService.checkMembership(
      document.workspaceId.toString(),
      userId
    );
    if (!membership) {
      throw new Error('Access denied: User is not a member of this workspace');
    }

    return document;
  }

  /**
   * List documents in workspace with cursor pagination
   */
  async list(query: ListDocumentsQuery): Promise<{
    documents: IDocument[];
    total: number;
    hasMore: boolean;
  }> {
    const { workspaceId, userId, status, limit = 20, offset = 0 } = query;

    // Verify workspace membership
    const membership = await workspaceService.checkMembership(workspaceId, userId);
    if (!membership) {
      throw new Error('User is not a member of this workspace');
    }

    // Build filter
    const filter: any = {
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    };

    if (status) {
      filter.status = status;
    }

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .populate('uploadedBy', 'email userName')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit + 1), // Get one extra to check if there are more
      DocumentModel.countDocuments(filter),
    ]);

    // Check if there are more documents
    const hasMore = documents.length > limit;
    if (hasMore) {
      documents.pop(); // Remove the extra document
    }

    return {
      documents,
      total,
      hasMore,
    };
  }

  /**
   * Update document status (for indexing workflow)
   */
  async updateStatus(data: UpdateDocumentStatusData): Promise<IDocument> {
    const { documentId, status, errorMessage } = data;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = status;
    if (errorMessage) {
      document.errorMessage = errorMessage;
    }

    await document.save();

    logger.info(`Document ${documentId} status updated to ${status}`);

    return document;
  }

  /**
   * Delete document and associated file
   */
  async delete(documentId: string, userId: string): Promise<void> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Verify workspace membership
    const membership = await workspaceService.checkMembership(
      document.workspaceId.toString(),
      userId
    );
    if (!membership) {
      throw new Error('Access denied: User is not a member of this workspace');
    }

    // Delete file from storage
    try {
      if (await storageService.fileExists(document.filePath)) {
        await storageService.deleteFile(document.filePath);
      }
    } catch (error) {
      logger.error(`Failed to delete file: ${document.filePath}`, error);
      // Continue with document deletion even if file deletion fails
    }

    // Delete document record
    await DocumentModel.findByIdAndDelete(documentId);

    logger.info(`Document deleted: ${documentId} by user ${userId}`);
  }

  /**
   * Get documents by status for batch processing
   */
  async getByStatus(
    status: DocumentStatus,
    limit: number = 10
  ): Promise<IDocument[]> {
    return DocumentModel.find({ status })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  /**
   * Get workspace document statistics
   */
  async getWorkspaceStats(workspaceId: string, userId: string): Promise<{
    total: number;
    byStatus: Record<DocumentStatus, number>;
    totalSize: number;
  }> {
    // Verify workspace membership
    const membership = await workspaceService.checkMembership(workspaceId, userId);
    if (!membership) {
      throw new Error('User is not a member of this workspace');
    }

    const stats = await DocumentModel.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;
    let totalSize = 0;

    for (const stat of stats) {
      byStatus[stat._id] = stat.count;
      total += stat.count;
      totalSize += stat.totalSize;
    }

    return {
      total,
      byStatus: byStatus as Record<DocumentStatus, number>,
      totalSize,
    };
  }
}

export const documentService = new DocumentService();
