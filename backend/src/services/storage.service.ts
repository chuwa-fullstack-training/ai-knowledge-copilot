import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR } from '../middleware/upload';
import logger from '../config/logger';

export interface StorageMetadata {
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private uploadsDir: string;

  constructor(uploadsDir: string = UPLOADS_DIR) {
    this.uploadsDir = uploadsDir;
  }

  /**
   * Get file metadata from uploaded file
   */
  async getFileMetadata(file: Express.Multer.File): Promise<StorageMetadata> {
    return {
      fileName: file.filename,
      filePath: file.path,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info(`File deleted: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to delete file: ${filePath}`, error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats (size, timestamps)
   */
  async getFileStats(filePath: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Move file to different location (for future use with cloud storage)
   */
  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      await fs.rename(sourcePath, destPath);
      logger.info(`File moved from ${sourcePath} to ${destPath}`);
    } catch (error) {
      throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get full file path
   */
  getFullPath(fileName: string): string {
    return path.join(this.uploadsDir, fileName);
  }

  /**
   * Validate file path is within uploads directory (security check)
   */
  isValidPath(filePath: string): boolean {
    const normalized = path.normalize(filePath);
    return normalized.startsWith(this.uploadsDir);
  }

  /**
   * Clean up old files (for maintenance)
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old files', error);
      throw new Error(`Failed to cleanup old files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const storageService = new StorageService();
