import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: 'Email is required.' })
        .email('Please provide a valid email address'),
      token: z
        .string({ required_error: 'Reset token is required.' })
        .min(1, 'Reset token cannot be empty'),
      newPassword: z
        .string({ required_error: 'New password is required.' })
        .min(6, 'Password must be at least 6 characters long')
        .max(50, 'Password cannot be more than 50 characters'),
      confirmPassword: z
        .string({ required_error: 'Confirm password is required.' })
        .min(1, 'Confirm password cannot be empty'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const AuthValidation = {
  loginValidationSchema,
  refreshTokenValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
