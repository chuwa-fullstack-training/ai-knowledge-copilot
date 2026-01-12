# User Profile Management

## Overview

The User Profile Management feature provides comprehensive profile functionality for users, including profile data, username, names, and avatar support during registration and through dedicated profile management endpoints.

## Features

### 1. Enhanced User Model

The User model has been extended with the following optional fields:

- **userName**: Unique username (3-30 characters, alphanumeric with underscores and hyphens)
- **firstName**: User's first name (up to 50 characters)
- **lastName**: User's last name (up to 50 characters)
- **avatarUrl**: URL to user's avatar image (auto-generated from Gravatar if not provided)

### 2. Automatic Gravatar Integration

When a user registers without providing an `avatarUrl`, the system automatically generates a Gravatar URL based on their email address. Gravatars provide:

- **Consistent identity** across platforms
- **Automatic updates** when users update their Gravatar
- **Default identicon** for users without a Gravatar account
- **Privacy-friendly** URL-based system

### 3. Registration with Profile Data

Users can now provide profile information during registration:

```typescript
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "userName": "john_doe",        // Optional
  "firstName": "John",            // Optional
  "lastName": "Doe",              // Optional
  "avatarUrl": "https://example.com/avatar.jpg"  // Optional (Gravatar used if omitted)
}
```

**Gravatar Auto-Generation**: If `avatarUrl` is not provided, the system generates: `https://www.gravatar.com/avatar/<md5_hash_of_email>?s=200&d=identicon`

### 4. Profile Management Endpoints

#### Get User Profile
```typescript
GET /api/v1/users/profile
Authorization: Bearer <token>

Response:
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "member",
    "createdAt": "2024-01-11T10:00:00.000Z",
    "updatedAt": "2024-01-11T10:00:00.000Z"
  }
}
```

#### Update User Profile
```typescript
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "userName": "new_username",      // Optional
  "firstName": "John",             // Optional
  "lastName": "Smith",             // Optional
  "avatarUrl": "https://example.com/new-avatar.jpg"  // Optional
}

Response:
{
  "user": {
    // Updated user object
  }
}
```

#### Delete User Account
```typescript
DELETE /api/v1/users/account
Authorization: Bearer <token>

Response: 204 No Content
```

## Validation Rules

### Username (userName)
- **Length**: 3-30 characters
- **Pattern**: Alphanumeric characters, underscores, and hyphens only
- **Example**: `john_doe`, `user123`, `test-user`

### First Name & Last Name
- **Max Length**: 50 characters each
- **Automatically trimmed** of leading/trailing whitespace

### Avatar URL
- **Must be a valid URL**
- **Format**: Standard HTTP/HTTPS URL
- **Example**: `https://example.com/avatar.jpg`

## Implementation Details

### Files Structure

```
backend/src/
├── models/
│   └── User.ts                      # Updated with new fields
├── controllers/
│   ├── auth.controller.ts           # Updated registration
│   └── user.controller.ts           # New profile controller
├── services/
│   ├── auth.service.ts              # Updated registration logic
│   └── user.service.ts              # New profile service
├── routes/
│   ├── auth.routes.ts               # Registration routes
│   └── user.routes.ts               # New profile routes
├── validators/
│   ├── auth.validators.ts           # Updated registration schema
│   └── user.validators.ts           # New profile validation
└── config/
    └── swagger.ts                   # Updated API documentation
```

### Database Schema

```typescript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  userName: { type: String, minlength: 3, maxlength: 30 },
  firstName: { type: String, maxlength: 50 },
  lastName: { type: String, maxlength: 50 },
  avatarUrl: { type: String },
  role: { type: String, enum: ['admin', 'member'], default: 'member' }
}, { timestamps: true });
```

## API Documentation

All endpoints are documented in Swagger/OpenAPI format. Access the interactive API documentation at:

```
http://localhost:3000/api/v1/docs
```

## Security Considerations

1. **Authentication Required**: All profile endpoints require valid JWT token
2. **User Isolation**: Users can only access and modify their own profile
3. **Password Protection**: Password hash is never exposed in API responses
4. **Input Validation**: All profile data is validated using Zod schemas
5. **URL Validation**: Avatar URLs are validated for proper format

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

**400 Validation Error**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "userName",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

**404 Not Found**
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

## Testing

### Manual Testing

1. **Register with Profile Data**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "userName": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Get Profile**:
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <your-token>"
```

3. **Update Profile**:
```bash
curl -X PUT http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "newusername",
    "firstName": "Updated"
  }'
```

### Integration Testing

Create test cases in `tests/user.test.ts` to cover:
- Profile retrieval
- Profile updates with valid data
- Profile updates with invalid data (validation errors)
- Account deletion
- Unauthorized access attempts

## Migration Notes

### Existing Users

Existing users in the database will have `undefined` values for the new optional fields (`userName`, `firstName`, `lastName`, `avatarUrl`). This is intentional and backward-compatible:

1. No database migration required
2. Existing users can update their profile to add these fields
3. New users can optionally provide these fields during registration
4. All profile fields remain optional for maximum flexibility

## Future Enhancements

Potential improvements for future versions:

1. **Email Verification**: Require email verification before account activation
2. **Avatar Upload**: Direct file upload support instead of URL-only
3. **Profile Visibility**: Control profile information visibility to other users
4. **Username Uniqueness**: Enforce unique usernames if required by business logic
5. **Profile Completion**: Track and encourage profile completion percentage
6. **Social Links**: Add support for social media profile links
7. **Bio/About**: Add user biography or about section

## References

- [Zod Validation Documentation](https://zod.dev/)
- [MongoDB Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
- [JWT Authentication](https://jwt.io/introduction)
