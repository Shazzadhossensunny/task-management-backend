import { z } from 'zod';

const registerUserValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: 'Name is required',
        })
        .min(1, 'Name cannot be empty')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
      email: z
        .string({
          required_error: 'Email is required',
        })
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
      password: z
        .string({
          required_error: 'Password is required',
        })
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
      .optional(),
    profileImage: z.string().url('Please provide a valid image URL').optional(),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string({
          required_error: 'Old password is required',
        })
        .min(1, 'Old password cannot be empty'),
      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(6, 'New password must be at least 6 characters'),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'New passwords do not match',
      path: ['confirmPassword'],
    }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    isActive: z.boolean({
      required_error: 'isActive field is required',
    }),
  }),
  params: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

const addPointsValidationSchema = z.object({
  body: z.object({
    points: z
      .number({
        required_error: 'Points is required',
      })
      .int('Points must be an integer')
      .min(1, 'Points must be at least 1'),
  }),
  params: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

const getUsersValidationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
        message: 'Page must be a positive number',
      }),
    limit: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100),
        {
          message: 'Limit must be a positive number and not exceed 100',
        },
      ),
  }),
});

export const UserValidation = {
  registerUserValidationSchema,
  updateProfileValidationSchema,
  changePasswordValidationSchema,
  updateUserStatusValidationSchema,
  addPointsValidationSchema,
  getUsersValidationSchema,
};
