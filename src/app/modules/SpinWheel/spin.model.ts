import { Schema, model } from 'mongoose';
import { ISpinResult, SPIN_CATEGORIES } from './spin.interface';

const spinResultSchema = new Schema<ISpinResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: SPIN_CATEGORIES,
        message: `Category must be one of: ${SPIN_CATEGORIES.join(', ')}`,
      },
    },
    spinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    pointsEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

spinResultSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true,
});

export const SpinResult = model<ISpinResult>('SpinResult', spinResultSchema);
