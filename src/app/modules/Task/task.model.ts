import { Schema, model } from 'mongoose';
import { TTask, TTaskCategory, TTaskStatus } from './task.interface';

const taskSchema = new Schema<TTask>(
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
      required: [true, 'Category is required'],
      enum: {
        values: [
          'arts_and_craft',
          'nature',
          'family',
          'sport',
          'friends',
          'meditation',
        ],
        message:
          'Category must be one of: arts_and_craft, nature, family, sport, friends, meditation',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'inprogress', 'done'],
        message: 'Status must be one of: pending, inprogress, done',
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
    },
    completedAt: {
      type: Date,
    },
    points: {
      type: Number,
      default: 10,
      min: [1, 'Points must be at least 1'],
      max: [100, 'Points cannot exceed 100'],
    },
    isCollaborative: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

// Pre middleware to set completedAt when status changes to done
taskSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as any;
  if (update.status === 'done' && !update.completedAt) {
    update.completedAt = new Date();
  }
  if (update.status !== 'done') {
    update.completedAt = undefined;
  }
});

// Static methods
taskSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId });
};

taskSchema.statics.findByCategory = function (category: TTaskCategory) {
  return this.find({ category });
};

taskSchema.statics.findByStatus = function (status: TTaskStatus) {
  return this.find({ status });
};

taskSchema.statics.getTaskStats = function (userId: string) {
  return this.aggregate([
    { $match: { userId: new Schema.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
      },
    },
  ]);
};

export const Task = model<TTask>('Task', taskSchema);
