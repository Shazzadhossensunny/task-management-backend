import { Schema, model } from 'mongoose';
import { ITask, TASK_CATEGORIES, TASK_STATUS } from './task.interface';

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Task category is required'],
      enum: {
        values: TASK_CATEGORIES,
        message: `Category must be one of: ${TASK_CATEGORIES.join(', ')}`,
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: TASK_STATUS,
        message: `Status must be one of: ${TASK_STATUS.join(', ')}`,
      },
      default: 'pending',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    points: {
      type: Number,
      default: 10,
      min: [1, 'Points must be at least 1'],
      max: [100, 'Points cannot exceed 100'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// taskSchema.index({ userId: 1, status: 1 });
// taskSchema.index({ category: 1 });
// taskSchema.index({ createdAt: -1 });
// taskSchema.index({ title: 'text', description: 'text' });

export const Task = model<ITask>('Task', taskSchema);
