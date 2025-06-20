import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import {
  TCreateTask,
  TUpdateTask,
  TTaskQuery,
  TTaskStatus,
} from './task.interface';
import { Task } from './task.model';
import { User } from '../User/user.model';

const createTask = async (userId: string, payload: TCreateTask) => {
  const taskData = {
    ...payload,
    userId,
  };

  const result = await Task.create(taskData);
  return result;
};

const getUserTasks = async (userId: string, query: TTaskQuery) => {
  const {
    search,
    category,
    status,
    isCollaborative,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  // Build filter object
  const filter: any = { userId };

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (typeof isCollaborative === 'boolean')
    filter.isCollaborative = isCollaborative;

  // Build search query
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('collaborators', 'name email');

  // Get total count for pagination
  const total = await Task.countDocuments(filter);

  return {
    tasks,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

const getTaskById = async (taskId: string, userId: string) => {
  const task = await Task.findOne({ _id: taskId, userId }).populate(
    'collaborators',
    'name email',
  );

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return task;
};

const updateTask = async (
  taskId: string,
  userId: string,
  payload: TUpdateTask,
) => {
  const task = await Task.findOneAndUpdate({ _id: taskId, userId }, payload, {
    new: true,
    runValidators: true,
  }).populate('collaborators', 'name email');

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  // If task is completed, add points to user
  if (payload.status === 'done' && task.status === 'done') {
    await User.findByIdAndUpdate(userId, { $inc: { points: task.points } });
  }

  return task;
};

const deleteTask = async (taskId: string, userId: string) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return { message: 'Task deleted successfully' };
};

const updateTaskStatus = async (
  taskId: string,
  userId: string,
  status: TTaskStatus,
) => {
  const task = await Task.findOne({ _id: taskId, userId });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  const wasCompleted = task.status === 'done';
  task.status = status;

  if (status === 'done') {
    task.completedAt = new Date();
  } else {
    task.completedAt = undefined;
  }

  await task.save();

  // Add points if task is newly completed
  if (status === 'done' && !wasCompleted) {
    await User.findByIdAndUpdate(userId, { $inc: { points: task.points } });
  }

  // Remove points if task was completed but now changed to other status
  if (wasCompleted && status !== 'done') {
    await User.findByIdAndUpdate(userId, { $inc: { points: -task.points } });
  }

  return task;
};

const getTaskStats = async (userId: string) => {
  const stats = await Task.aggregate([
    { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
      },
    },
  ]);

  // Format stats
  const formattedStats = {
    pending: 0,
    inprogress: 0,
    done: 0,
    totalTasks: 0,
    totalPoints: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
    formattedStats.totalTasks += stat.count;
    if (stat._id === 'done') {
      formattedStats.totalPoints = stat.totalPoints;
    }
  });

  return formattedStats;
};

const getTasksByCategory = async (userId: string) => {
  const categoryStats = await Task.aggregate([
    { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
        },
      },
    },
  ]);

  return categoryStats;
};

const getRandomTaskForSpin = async (userId: string, category?: string) => {
  const filter: any = { userId, status: { $ne: 'done' } };
  if (category) filter.category = category;

  const tasks = await Task.find(filter);

  if (tasks.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No available tasks for spinning',
    );
  }

  const randomIndex = Math.floor(Math.random() * tasks.length);
  return tasks[randomIndex];
};

export const TaskServices = {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
  getTasksByCategory,
  getRandomTaskForSpin,
};
