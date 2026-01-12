# Backend API Documentation

## Phase 1: Authentication & Workspace Management

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (201):
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "member",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGc..."
}
```

**Password Requirements:**
- Minimum 8 characters
- Maximum 100 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "member"
  }
}
```

### Workspace Endpoints

All workspace endpoints require authentication via Bearer token.

#### Create Workspace
```http
POST /workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workspace"
}

Response (201):
{
  "workspace": {
    "_id": "...",
    "name": "My Workspace",
    "members": [{
      "userId": "...",
      "role": "admin",
      "joinedAt": "..."
    }],
    "createdBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### List User Workspaces
```http
GET /workspaces
Authorization: Bearer <token>

Response (200):
{
  "workspaces": [
    {
      "_id": "...",
      "name": "My Workspace",
      "members": [...],
      "createdAt": "..."
    }
  ]
}
```

#### Get Workspace by ID
```http
GET /workspaces/:workspaceId
Authorization: Bearer <token>

Response (200):
{
  "workspace": { ... }
}
```

#### Delete Workspace (Admin only)
```http
DELETE /workspaces/:workspaceId
Authorization: Bearer <token>

Response (204): No content
```

#### Invite Member (Admin only)
```http
POST /workspaces/:workspaceId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "...",
  "role": "member"  // optional, defaults to "member"
}

Response (200):
{
  "workspace": { ... }
}
```

#### Remove Member (Admin only)
```http
DELETE /workspaces/:workspaceId/members/:userId
Authorization: Bearer <token>

Response (200):
{
  "workspace": { ... }
}
```

#### Update Member Role (Admin only)
```http
PATCH /workspaces/:workspaceId/members/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"  // or "member"
}

Response (200):
{
  "workspace": { ... }
}
```

### Rate Limits

- **General API**: 100 requests per 15 minutes
- **Auth endpoints** (login/register): 5 requests per 15 minutes

### Error Responses

All errors follow this format:
```json
{
  "error": "Error Name",
  "message": "Detailed error message",
  "details": []  // Optional validation details
}
```

**Common Status Codes:**
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## Running the Server

### Development Mode
```bash
cd backend
bun run dev
```

### Production Mode
```bash
cd backend
bun run start
```

### Run Tests
```bash
cd backend
bun test
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32-character-minimum-secret>
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:5173
```

## Testing with cURL

### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Create workspace (replace TOKEN)
```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My Test Workspace"}'
```

### Get current user
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```
