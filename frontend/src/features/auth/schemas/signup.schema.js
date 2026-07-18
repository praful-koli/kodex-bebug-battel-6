import { z } from 'zod';

// Step 1: Account credentials
export const accountStepSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .toLowerCase()
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only contain lowercase letters, numbers, and underscores'
    ),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

// Step 2: Personal information
export const personalInfoStepSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
});

// Step 3: Avatar selection
export const avatarStepSchema = z.object({
  avatar: z
    .string({ required_error: 'Please select an avatar' })
    .url('Invalid avatar URL'),
});

// Combined schema for final submission
export const completeSignupSchema = z.object({
  username: accountStepSchema.shape.username,
  password: accountStepSchema.shape.password,
  fullName: personalInfoStepSchema.shape.fullName,
  avatar: avatarStepSchema.shape.avatar,
});
