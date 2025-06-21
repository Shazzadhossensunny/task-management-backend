import { z } from 'zod';
import { SPIN_CATEGORIES } from './spin.interface';

const spinCategorySchema = z.enum([
  ...(SPIN_CATEGORIES as [string, ...string[]]),
]);

export const spinWheelValidationSchema = z.object({
  body: z.object({
    categories: z
      .array(spinCategorySchema)
      .optional()
      .refine((cats) => !cats || cats.length > 0, {
        message: 'At least one category must be selected',
      }),
    excludeCompleted: z.boolean().optional().default(true),
  }),
});

export const completeSpinValidationSchema = z.object({
  body: z.object({
    spinResultId: z
      .string({ required_error: 'Spin result ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid spin result ID format' }),
  }),
});

export const getSpinHistoryValidationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: 'Page must be a number',
      }),
    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: 'Limit must be a number',
      }),
    category: spinCategorySchema.optional(),
    completed: z
      .string()
      .optional()
      .refine((val) => !val || val === 'true' || val === 'false', {
        message: 'Completed must be true or false',
      }),
  }),
});

export const SpinValidation = {
  spinWheelValidationSchema,
  completeSpinValidationSchema,
  getSpinHistoryValidationSchema,
};
