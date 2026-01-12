# Backend Implementation - Phase 1 Complete

## Overview

This backend implementation provides a complete authentication and workspace management system built with:
- **Runtime:** Bun 1.0+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, rate limiting

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   ├── env.ts           # Environment validation (Zod)
│   │   ├── logger.ts        # Winston logger
│   │   └── swagger.ts       # Swagger/OpenAPI config
│   ├── models/
│   │   ├── User.ts          # User schema (with profile fields)
│   │   └── Workspace.ts     # Workspace schema
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   ├── workspace.service.ts # Workspace business logic
│   │   └── user.service.ts      # User profile business logic
│   ├── controllers/
│   │   ├── auth.controller.ts      # Auth HTTP handlers
│   │   ├── workspace.controller.ts # Workspace HTTP handlers
│   │   └── user.controller.ts      # User profile HTTP handlers
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── authorization.ts     # Workspace access control
│   │   ├── errorHandler.ts      # Global error handler
│   │   ├── validation.ts        # Zod validation wrapper
│   │   └── rateLimiter.ts       # Rate limiting
│   ├── validators/
│   │   ├── auth.validators.ts      # Auth schemas (with profile fields)
│   │   ├── workspace.validators.ts # Workspace schemas
│   │   └── user.validators.ts      # User profile schemas
│   ├── routes/
│   │   ├── auth.routes.ts      # Auth endpoints
│   │   ├── workspace.routes.ts # Workspace endpoints
│   │   └── user.routes.ts      # User profile endpoints
│   ├── utils/
│   │   ├── jwt.ts           # JWT helpers
│   │   └── password.ts      # bcrypt helpers
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/
│   └── auth.test.ts         # Sample tests
├── package.json
├── tsconfig.json
├── .env
├── API.md                   # API documentation
└── README.md                # This file
```

## Features Implemented

### Authentication System
- ✅ User registration with password hashing (bcrypt, 10 rounds)
- ✅ User login with JWT token generation
- ✅ Get current user endpoint
- ✅ JWT verification middleware
- ✅ Password validation (min 8 chars, uppercase, lowercase, number)
- ✅ Rate limiting (5 requests per 15 minutes for auth endpoints)
- ✅ Optional profile fields during registration (userName, firstName, lastName, avatarUrl)

### User Profile Management
- ✅ Get user profile with all fields
- ✅ Update user profile (userName, firstName, lastName, avatarUrl)
- ✅ Delete user account
- ✅ Profile field validation (username pattern, name lengths, URL format)
- ✅ Backward compatible optional fields

### Workspace Management
- ✅ Create workspace (auto-assign creator as admin)
- ✅ List user workspaces
- ✅ Get workspace by ID
- ✅ Delete workspace (admin only)
- ✅ Invite members with role assignment
- ✅ Remove members (admin only)
- ✅ Update member roles (admin only)
- ✅ Workspace access control middleware

### Security & Validation
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Global rate limiting (100 requests per 15 minutes)
- ✅ Auth rate limiting (5 requests per 15 minutes)
- ✅ Zod validation on all endpoints
- ✅ Global error handler with proper status codes
- ✅ JWT with 7-day expiration
- ✅ Request logging (Winston)

## Environment Setup

1. **Create `.env` file:**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=<generate-random-32-character-string>
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:5173
```

2. **Install dependencies:**
```bash
bun install
```

3. **Verify MongoDB connection:**
- Ensure MongoDB Atlas cluster is running
- Whitelist your IP address (0.0.0.0/0 for development)
- Test connection string in MongoDB Compass

## Running the Server

### Development Mode (with hot reload)
```bash
bun run dev
```

### Production Mode
```bash
bun run start
```

### Build for Production
```bash
bun run build
```

### Run Tests
```bash
bun test
```

## Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "userName": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

Response:
```json
{
  "user": {
    "_id": "...",
    "email": "test@example.com",
    "userName": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "member",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 4. Get Current User
```bash
# Save token from login/register response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Create Workspace
```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Test Workspace"
  }'
```

### 6. List Workspaces
```bash
curl -X GET http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Invite Member (save workspaceId and userId from previous responses)
```bash
curl -X POST http://localhost:3000/api/v1/workspaces/{workspaceId}/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "another-user-id",
    "role": "member"
  }'
```

### 8. Get User Profile
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Update User Profile
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userName": "newusername",
    "firstName": "Updated",
    "lastName": "Name",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }'
```

### 10. Delete User Account
```bash
curl -X DELETE http://localhost:3000/api/v1/users/account \
  -H "Authorization: Bearer $TOKEN"
```

## Validation Rules

### Registration
- **Email:** Valid email format
- **Password:**
  - Min 8 characters
  - Max 100 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **userName (optional):**
  - Min 3 characters
  - Max 30 characters
  - Alphanumeric with underscores and hyphens only
- **firstName (optional):** Max 50 characters
- **lastName (optional):** Max 50 characters
- **avatarUrl (optional):** Valid URL format

### Profile Update
- **userName:** Same rules as registration
- **firstName:** Max 50 characters
- **lastName:** Max 50 characters
- **avatarUrl:** Valid URL format
- All fields are optional in updates

### Workspace Creation
- **Name:** 1-100 characters, trimmed

### Member Invitation
- **userId:** Valid MongoDB ObjectId (24 hex characters)
- **role:** Either "admin" or "member"

## Error Handling

All errors return consistent JSON format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": []  // Optional validation details
}
```

### Common Error Codes
- **400:** Bad Request (validation errors)
- **401:** Unauthorized (missing/invalid token)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found
- **409:** Conflict (duplicate resource)
- **429:** Too Many Requests (rate limit)
- **500:** Internal Server Error

## Security Features

1. **Password Security:**
   - bcrypt hashing with 10 salt rounds
   - Password requirements enforced
   - Passwords never exposed in API responses

2. **JWT Security:**
   - 32+ character secret required
   - 7-day token expiration
   - Signed with HS256 algorithm
   - Issuer verification

3. **Rate Limiting:**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - IP-based tracking

4. **HTTP Security:**
   - Helmet.js security headers
   - CORS with origin restriction
   - Request size limits (10MB)

5. **Authorization:**
   - Workspace membership verification
   - Role-based access control (admin/member)
   - Last admin protection (can't remove/demote)

## Database Schema

### User Model
```typescript
{
  email: string (unique, lowercase, indexed)
  passwordHash: string
  userName?: string (3-30 chars, alphanumeric with _-)
  firstName?: string (max 50 chars)
  lastName?: string (max 50 chars)
  avatarUrl?: string (valid URL)
  role: 'admin' | 'member'
  createdAt: Date
  updatedAt: Date
}
```

### Workspace Model
```typescript
{
  name: string
  members: [{
    userId: ObjectId (ref: User)
    role: 'admin' | 'member'
    joinedAt: Date
  }]
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

## Troubleshooting

### MongoDB Connection Failed
1. Check MONGODB_URI format
2. Verify IP whitelist in Atlas (allow 0.0.0.0/0 for dev)
3. Ensure cluster is active
4. Test connection with MongoDB Compass

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Environment Variables Not Loading
- Bun automatically loads .env files
- Verify .env file exists in backend directory
- Check env.ts validation errors in console

### JWT Secret Too Short
```bash
# Generate a secure 32-character secret
openssl rand -base64 32
```

## Next Steps (Phase 2)

- [ ] Document upload and management
- [ ] File storage service
- [ ] Document status tracking
- [ ] Cursor-based pagination
- [ ] Integration tests with MongoDB memory server

## References

- [API Documentation](./API.md)
- [User Profile Management Guide](../docs/USER_PROFILE_MANAGEMENT.md)
- [Swagger/OpenAPI Documentation](http://localhost:3000/api/v1/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Zod Validation](https://zod.dev/)

## Contributors

Built following the AI Knowledge Copilot Implementation Brief (Phase 1).
