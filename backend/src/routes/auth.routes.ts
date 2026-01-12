import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting and validation
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
