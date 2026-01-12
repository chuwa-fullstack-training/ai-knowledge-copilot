import { z } from 'zod';

export const updateProfileSchema = z.object({
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  firstName: z
    .string()
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});
