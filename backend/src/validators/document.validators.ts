import { z } from 'zod';

// Upload document validation
// Note: body validation happens after multer processes the multipart data
export const uploadDocumentSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
  }).optional(), // Make body optional since multer hasn't processed it yet
});

// List documents validation
export const listDocumentsSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  query: z.object({
    status: z.enum(['uploading', 'uploaded', 'indexing', 'indexed', 'failed']).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).refine(val => val >= 0, 'Offset must be non-negative').optional(),
  }),
});

// Get document by ID validation
export const getDocumentSchema = z.object({
  params: z.object({
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID'),
  }),
});

// Update document status validation
export const updateDocumentStatusSchema = z.object({
  params: z.object({
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID'),
  }),
  body: z.object({
    status: z.enum(['uploading', 'uploaded', 'indexing', 'indexed', 'failed']),
    errorMessage: z.string().max(500).optional(),
  }),
});

// Delete document validation
export const deleteDocumentSchema = z.object({
  params: z.object({
    documentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid document ID'),
  }),
});

// Get workspace stats validation
export const getWorkspaceStatsSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
});
