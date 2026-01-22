import { Router } from "express";
import { documentController } from "../controllers/document.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { upload, handleUploadError } from "../middleware/upload";
import {
  uploadDocumentSchema,
  listDocumentsSchema,
  getDocumentSchema,
  updateDocumentStatusSchema,
  deleteDocumentSchema,
  getWorkspaceStatsSchema,
} from "../validators/document.validators";

const router = Router();

/**
 * @swagger
 * /workspaces/{workspaceId}/documents/upload:
 *   post:
 *     summary: Upload document to workspace
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, Word, Excel, PowerPoint, Text, Markdown, CSV)
 *               title:
 *                 type: string
 *                 description: Optional document title (defaults to filename)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request (no file, invalid file type, file too large)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/workspaces/:workspaceId/documents/upload",
  authenticate,
  upload.single("file"),
  handleUploadError,
  validate(uploadDocumentSchema),
  documentController.upload.bind(documentController),
);

/**
 * @swagger
 * /workspaces/{workspaceId}/documents:
 *   get:
 *     summary: List documents in workspace
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploading, uploaded, indexing, indexed, failed]
 *         description: Filter by document status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of documents to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of documents to skip
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *                 total:
 *                   type: integer
 *                   description: Total number of documents matching the filter
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more documents to fetch
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       500:
 *         description: Internal server error
 */
router.get(
  "/workspaces/:workspaceId/documents",
  authenticate,
  validate(listDocumentsSchema),
  documentController.list.bind(documentController),
);

/**
 * @swagger
 * /documents/{documentId}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/documents/:documentId",
  authenticate,
  validate(getDocumentSchema),
  documentController.getById.bind(documentController),
);

/**
 * @swagger
 * /documents/{documentId}/status:
 *   patch:
 *     summary: Update document status
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [uploading, uploaded, indexing, indexed, failed]
 *                 description: New document status
 *               errorMessage:
 *                 type: string
 *                 description: Error message (for failed status)
 *     responses:
 *       200:
 *         description: Document status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/documents/:documentId/status",
  authenticate,
  validate(updateDocumentStatusSchema),
  documentController.updateStatus.bind(documentController),
);

/**
 * @swagger
 * /documents/{documentId}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       204:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/documents/:documentId",
  authenticate,
  validate(deleteDocumentSchema),
  documentController.delete.bind(documentController),
);

/**
 * @swagger
 * /workspaces/{workspaceId}/documents/stats:
 *   get:
 *     summary: Get workspace document statistics
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of documents
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         uploading:
 *                           type: integer
 *                         uploaded:
 *                           type: integer
 *                         indexing:
 *                           type: integer
 *                         indexed:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                     totalSize:
 *                       type: integer
 *                       description: Total size of all documents in bytes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a workspace member)
 *       500:
 *         description: Internal server error
 */
router.get(
  "/workspaces/:workspaceId/documents/stats",
  authenticate,
  validate(getWorkspaceStatsSchema),
  documentController.getStats.bind(documentController),
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Document ID
 *         workspaceId:
 *           type: string
 *           description: Workspace ID
 *         title:
 *           type: string
 *           description: Document title
 *         originalName:
 *           type: string
 *           description: Original filename
 *         fileName:
 *           type: string
 *           description: Stored filename
 *         filePath:
 *           type: string
 *           description: File path on server
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         size:
 *           type: integer
 *           description: File size in bytes
 *         status:
 *           type: string
 *           enum: [uploading, uploaded, indexing, indexed, failed]
 *           description: Document processing status
 *         uploadedBy:
 *           type: string
 *           description: User ID who uploaded the document
 *         errorMessage:
 *           type: string
 *           description: Error message (if status is failed)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

export default router;
