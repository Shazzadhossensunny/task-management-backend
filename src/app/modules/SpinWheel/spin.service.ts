import { Types } from 'mongoose';
import { SpinResult } from './spin.model';
import { Task } from '../Task/task.model';
import {
  ISpinResult,
  ISpinRequest,
  ISpinResponse,
  ISpinHistory,
  SPIN_CATEGORIES,
} from './spin.interface';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

export const spinWheel = async (
  userId: string,
  spinData: ISpinRequest,
): Promise<ISpinResponse> => {
  const { categories = [], excludeCompleted = true } = spinData;

  // Validate that at least one category is selected
  if (categories.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please select at least one category to spin the wheel.',
    );
  }

  // Validate categories
  const invalidCategories = categories.filter(
    (cat) => !SPIN_CATEGORIES.includes(cat),
  );
  if (invalidCategories.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid categories: ${invalidCategories.join(', ')}`,
    );
  }

  const taskFilter: any = {
    userId: new Types.ObjectId(userId),
    status: { $ne: 'done' },
    category: { $in: categories }, // Only search in selected categories
  };

  if (excludeCompleted) {
    // Get recent incomplete spins from last 24 hours
    const recentSpins = await SpinResult.find({
      userId: new Types.ObjectId(userId),
      isCompleted: false,
      spinDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).select('taskId');

    const excludeTaskIds = recentSpins.map((spin) => spin.taskId);
    if (excludeTaskIds.length > 0) {
      taskFilter._id = { $nin: excludeTaskIds };
    }
  }

  const availableTasks = await Task.find(taskFilter);

  if (availableTasks.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No available tasks found in the selected categories. Try creating new tasks or selecting different categories.',
    );
  }

  // Randomly select a task
  const randomIndex = Math.floor(Math.random() * availableTasks.length);
  const selectedTask = availableTasks[randomIndex];

  // Check if there's already a pending spin for this task
  const existingPendingSpin = await SpinResult.findOne({
    userId: new Types.ObjectId(userId),
    taskId: selectedTask._id,
    isCompleted: false,
  });

  if (existingPendingSpin && excludeCompleted) {
    // If there's already a pending spin, return it instead of creating a new one
    return {
      task: {
        _id: selectedTask._id,
        title: selectedTask.title,
        description: selectedTask.description,
        category: selectedTask.category,
        points: selectedTask.points,
      },
      spinResult: existingPendingSpin,
      message: `You have a pending task from ${selectedTask.category.replace('-', ' & ')} category! Complete this task to earn ${selectedTask.points} points.`,
    };
  }

  // Create new spin result
  const spinResult = new SpinResult({
    userId: new Types.ObjectId(userId),
    taskId: selectedTask._id,
    category: selectedTask.category,
    spinDate: new Date(),
  });

  await spinResult.save();

  return {
    task: {
      _id: selectedTask._id,
      title: selectedTask.title,
      description: selectedTask.description,
      category: selectedTask.category,
      points: selectedTask.points,
    },
    spinResult,
    message: `🎉 You spun ${selectedTask.category.replace('-', ' & ')} category! Complete this task to earn ${selectedTask.points} points.`,
  };
};

export const SpinServices = {
  spinWheel,
};
