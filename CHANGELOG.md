# Changelog

All notable changes to the AI Knowledge Copilot Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
