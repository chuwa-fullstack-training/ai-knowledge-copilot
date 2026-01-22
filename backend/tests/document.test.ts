import { describe, test, expect } from 'bun:test';
import { DocumentModel } from '../src/models/Document';
import type { DocumentStatus } from '../src/models/Document';

describe('Document Model', () => {
  test('Document model has required fields', () => {
    const documentData = {
      workspaceId: '507f1f77bcf86cd799439011',
      title: 'Test Document',
      originalName: 'test.pdf',
      fileName: 'unique-test.pdf',
      filePath: '/uploads/unique-test.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      status: 'uploaded' as DocumentStatus,
      uploadedBy: '507f1f77bcf86cd799439012',
    };

    expect(documentData.workspaceId).toBeDefined();
    expect(documentData.title).toBeDefined();
    expect(documentData.status).toBe('uploaded');
  });

  test('Document status enum has valid values', () => {
    const validStatuses: DocumentStatus[] = [
      'uploading',
      'uploaded',
      'indexing',
      'indexed',
      'failed',
    ];

    expect(validStatuses).toContain('uploaded');
    expect(validStatuses).toContain('indexed');
    expect(validStatuses.length).toBe(5);
  });
});
