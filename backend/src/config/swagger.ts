import swaggerJSDoc from 'swagger-jsdoc';
import env from './env';

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AI Knowledge Copilot API',
    version: '1.0.0',
    description:
      'RAG-powered learning assistant API with authentication, workspace management, and AI-powered knowledge retrieval',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'Development server',
    },
    {
      url: 'https://api.example.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error type',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
        },
        required: ['error', 'message'],
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User name',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Workspace ID',
          },
          name: {
            type: 'string',
            description: 'Workspace name',
          },
          owner: {
            type: 'string',
            description: 'Owner user ID',
          },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'Member user ID',
                },
                role: {
                  type: 'string',
                  enum: ['admin', 'member'],
                  description: 'Member role',
                },
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Workspace creation timestamp',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            maxLength: 100,
            description:
              'Password (min 8 chars, must contain uppercase, lowercase, and number)',
            example: 'SecurePass123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'SecurePass123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT authentication token (valid for 7 days)',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      CreateWorkspaceRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Workspace name',
            example: 'My Workspace',
          },
        },
      },
      InviteMemberRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$',
            description: 'User ID to invite (MongoDB ObjectId)',
            example: '507f1f77bcf86cd799439011',
          },
          role: {
            type: 'string',
            enum: ['admin', 'member'],
            default: 'member',
            description: 'Member role',
          },
        },
      },
      UpdateMemberRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['admin', 'member'],
            description: 'New member role',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required or token invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Unauthorized',
              message: 'No token provided',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Forbidden',
              message: 'This action requires admin role',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Not Found',
              message: 'Workspace not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Validation Error',
              message: 'Invalid email format',
            },
          },
        },
      },
      RateLimitError: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Too Many Requests',
              message: 'Too many requests from this IP, please try again later',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and registration endpoints',
    },
    {
      name: 'Workspaces',
      description: 'Workspace management and member operations',
    },
    {
      name: 'Health',
      description: 'Health check and status endpoints',
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
