import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';

// Allowed file types for document uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json', // Added for JSON file support
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadsDir();
      cb(null, UPLOADS_DIR);
    } catch (error) {
      cb(error as Error, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-original
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedBasename}${ext}`);
  },
});

// File filter for validation
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: PDF, Word, Excel, PowerPoint, Text, Markdown, CSV, JSON`
      )
    );
    return;
  }

  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Single file upload
  },
});

// Middleware error handler for multer errors
export function handleUploadError(
  error: any,
  req: Express.Request,
  res: any,
  next: any
): void {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'Bad Request',
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Too many files. Only one file allowed per upload',
      });
      return;
    }
    res.status(400).json({
      error: 'Bad Request',
      message: error.message,
    });
    return;
  }

  if (error) {
    res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'File upload failed',
    });
    return;
  }

  next();
}

export { UPLOADS_DIR, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
