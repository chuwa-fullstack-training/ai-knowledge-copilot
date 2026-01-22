# Changelog

All notable changes to the AI Knowledge Copilot Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-01-21

### Added
- **Document Upload & Management**: Complete document management system (Phase 2)
  - POST `/api/v1/workspaces/:workspaceId/documents/upload` - Upload document with multipart/form-data
  - GET `/api/v1/workspaces/:workspaceId/documents` - List documents with pagination and filtering
  - GET `/api/v1/documents/:documentId` - Get single document by ID
  - PATCH `/api/v1/documents/:documentId/status` - Update document processing status
  - DELETE `/api/v1/documents/:documentId` - Delete document and file
  - GET `/api/v1/workspaces/:workspaceId/documents/stats` - Get workspace document statistics

- **File Upload System**
  - Multer middleware with file type validation
  - Support for PDF, Word, Excel, PowerPoint, Text, Markdown, CSV
  - File size limit: 50MB
  - Unique filename generation with timestamp and random hash
  - Sanitized filenames for security
  - Error handling for upload failures

- **Storage Service**
  - Local filesystem storage
  - File metadata extraction
  - File operations: delete, exists, stats, move
  - Path validation for security
  - Cleanup functionality for old files

- **Document Status Workflow**
  - Status tracking: uploading → uploaded → indexing → indexed/failed
  - Error message storage for failed documents
  - Status update endpoint for indexing pipeline integration

- **Frontend Components**
  - DocumentList component with status indicators
  - DocumentUpload component with drag-and-drop
  - Real-time upload progress tracking
  - Document statistics dashboard
  - Empty states and loading indicators

### Changed
- **Document Model**: Comprehensive schema for document management
  - workspaceId, title, originalName, fileName, filePath
  - mimeType, size, status, uploadedBy, errorMessage
  - Compound indexes for performance

- **API Documentation**: Extended Swagger schemas
  - Document schema with all fields
  - Upload endpoint with multipart/form-data
  - Pagination parameters and responses
  - Statistics response format

### Documentation
- Added `docs/PHASE_2_IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- Added `docs/DOCUMENT_API_REFERENCE.md` - Comprehensive API reference guide
- Updated `IMPLEMENTATION_BRIEF.md` - Marked Phase 2 as completed
- Updated `README.md` - Added Phase 2 status and features

### Security
- Workspace membership validation on all document operations
- File type validation (whitelist approach)
- File size limits to prevent abuse
- Sanitized filenames to prevent path traversal
- Rate limiting on upload endpoint (10 uploads per 15 minutes)

### Technical Details
- New backend files: Document.ts, upload.ts, storage.service.ts, document.service.ts, document.controller.ts, document.validators.ts, document.routes.ts
- New frontend files: document.ts (API), DocumentList.tsx, DocumentUpload.tsx, DocumentsPage.tsx
- Build verified: TypeScript compilation successful, no errors
- Frontend bundle: 395.73 kB (129.01 kB gzipped)

### Performance
- Cursor-based pagination for large document lists
- Compound MongoDB indexes for efficient queries
- Aggregation pipeline for statistics
- File upload progress tracking with XMLHttpRequest

## [1.1.0] - 2026-01-11

### Added
- **User Profile Management**: Comprehensive user profile functionality
  - Optional profile fields during registration (userName, firstName, lastName, avatarUrl)
  - GET `/api/v1/users/profile` - Retrieve user profile
  - PUT `/api/v1/users/profile` - Update user profile
  - DELETE `/api/v1/users/account` - Delete user account
  - Username validation (3-30 characters, alphanumeric with underscores and hyphens)
  - Name validation (max 50 characters for firstName and lastName)
  - Avatar URL validation
  - Complete Swagger/OpenAPI documentation for profile endpoints

### Changed
- **User Model**: Extended with optional profile fields
  - Added `userName` field with validation
  - Added `firstName` field
  - Added `lastName` field
  - Added `avatarUrl` field
- **Registration**: Now accepts optional profile fields
  - Updated `RegisterData` interface
  - Extended registration validation schema
  - Updated auth service to handle profile data
- **API Documentation**: Updated Swagger schemas
  - Enhanced `User` schema with profile fields
  - Updated `RegisterRequest` schema
  - Added `UpdateProfileRequest` schema
  - Added "User Profile" tag

### Documentation
- Added `docs/USER_PROFILE_MANAGEMENT.md` - Comprehensive feature guide
- Added `docs/USER_PROFILE_IMPLEMENTATION_SUMMARY.md` - Implementation details
- Updated `backend/README.md` - Added profile management examples and validation rules
- Updated Swagger/OpenAPI documentation at `/api/v1/docs`

### Security
- All profile endpoints require JWT authentication
- Profile data can only be accessed/modified by the authenticated user
- Input validation on all profile fields

### Technical Details
- New files: `user.service.ts`, `user.controller.ts`, `user.validators.ts`, `user.routes.ts`
- Backward compatible: All profile fields are optional
- No database migration required

## [1.0.0] - 2026-01-10

### Added
- **Authentication System**
  - User registration with bcrypt password hashing
  - JWT-based authentication
  - Login endpoint
  - Get current user endpoint
  - Password validation (minimum 8 characters, uppercase, lowercase, number)

- **Workspace Management**
  - Create workspace
  - List user workspaces
  - Get workspace by ID
  - Delete workspace (admin only)
  - Invite members with role assignment
  - Remove members (admin only)
  - Update member roles (admin only)
  - Workspace access control middleware

- **Security Features**
  - Helmet.js security headers
  - CORS configuration
  - Rate limiting (general and auth-specific)
  - JWT with 7-day expiration
  - Request logging with Winston

- **Validation & Error Handling**
  - Zod schema validation on all endpoints
  - Global error handler with consistent format
  - Comprehensive error codes (400, 401, 403, 404, 409, 429, 500)

- **API Documentation**
  - Swagger/OpenAPI 3.0 documentation
  - Interactive API docs at `/api/v1/docs`

- **Development Tools**
  - Bun runtime support
  - TypeScript configuration
  - ESLint setup
  - Environment validation with Zod

### Database
- MongoDB with Mongoose ODM
- User model with email, passwordHash, role
- Workspace model with members and access control

### Infrastructure
- Express.js web framework
- Health check endpoint
- Structured logging
- Environment-based configuration

---

## Version Guidelines

- **Major version (X.0.0)**: Breaking API changes or major architectural changes
- **Minor version (0.X.0)**: New features, backward-compatible changes
- **Patch version (0.0.X)**: Bug fixes, minor improvements

## Links

- [User Profile Management Guide](./docs/USER_PROFILE_MANAGEMENT.md)
- [API Documentation](./backend/API.md)
- [Swagger Documentation](http://localhost:3000/api/v1/docs)
