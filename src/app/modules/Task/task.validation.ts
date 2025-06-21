import { z } from 'zod';
import { TASK_CATEGORIES, TASK_STATUS } from './task.interface';

const taskCategorySchema = z.enum([
  ...(TASK_CATEGORIES as [string, ...string[]]),
]);

const taskStatusSchema = z.enum([...(TASK_STATUS as [string, ...string[]])]);

export const createTaskValidationSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  category: taskCategorySchema,
  dueDate: z
    .string()
    .optional()
    .refine((date) => !date || new Date(date) > new Date(), {
      message: 'Due date must be in the future',
    }),
  points: z
    .number()
    .min(1, 'Points must be at least 1')
    .max(100, 'Points cannot exceed 100')
    .optional(),
});

export const updateTaskValidationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
  category: taskCategorySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z
    .string()
    .optional()
    .refine((date) => !date || new Date(date) > new Date(), {
      message: 'Due date must be in the future',
    }),
  points: z
    .number()
    .min(1, 'Points must be at least 1')
    .max(100, 'Points cannot exceed 100')
    .optional(),
});

export const updateTaskStatusValidationSchema = z.object({
  status: taskStatusSchema,
});

export const getTasksValidationSchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), 'Page must be a number'),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), 'Limit must be a number'),
  category: taskCategorySchema.optional(),
  status: taskStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title', 'dueDate', 'points'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const TaskValidation = {
  createTaskValidationSchema,
  updateTaskValidationSchema,
  updateTaskStatusValidationSchema,
  getTasksValidationSchema,
};
