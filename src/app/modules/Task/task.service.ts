import { Types } from 'mongoose';
import { Task } from './task.model';
import {
  ITask,
  ITaskCreate,
  ITaskUpdate,
  ITaskQuery,
  TTaskCategory,
  TASK_CATEGORIES,
} from './task.interface';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

export const createTask = async (
  userId: string,
  taskData: ITaskCreate,
): Promise<ITask> => {
  const task = new Task({
    ...taskData,
    userId: new Types.ObjectId(userId),
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
  });

  return await task.save();
};

export const getTasks = async (userId: string, query: ITaskQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId: new Types.ObjectId(userId) };

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const sort: any = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getTaskById = async (
  userId: string,
  taskId: string,
): Promise<ITask> => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid task ID');
  }

  const task = await Task.findOne({
    _id: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return task;
};

export const updateTask = async (
  userId: string,
  taskId: string,
  updateData: ITaskUpdate,
): Promise<ITask> => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid task ID');
  }

  const update: any = { ...updateData };

  if (updateData.dueDate) {
    update.dueDate = new Date(updateData.dueDate);
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    },
    update,
    { new: true, runValidators: true },
  );

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return task;
};

export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  status: string,
): Promise<ITask> => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid task ID');
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    },
    { status },
    { new: true, runValidators: true },
  );

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return task;
};

export const deleteTask = async (
  userId: string,
  taskId: string,
): Promise<void> => {
  if (!Types.ObjectId.isValid(taskId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid task ID');
  }

  const task = await Task.findOneAndDelete({
    _id: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }
};

export const getTaskStats = async (userId: string) => {
  const stats = await Task.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
      },
    },
  ]);

  const categoryStats = await Task.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
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

  return { statusStats: stats, categoryStats };
};

export const getTasksByCategory = async (
  userId: string,
  category: string,
): Promise<ITask[]> => {
  if (!TASK_CATEGORIES.includes(category as TTaskCategory)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid category');
  }

  return await Task.find({
    userId: new Types.ObjectId(userId),
    category,
    status: { $ne: 'done' },
  }).lean();
};

export const TaskServices = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getTasksByCategory,
};
