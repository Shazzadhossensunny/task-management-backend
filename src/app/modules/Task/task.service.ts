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
import QueryBuilder from '../../builder/QueryBuilder';

export const createTask = async (taskData: ITaskCreate) => {
  const result = await Task.create(taskData);
  return result;
};

export const getTasks = async (userId: string, query: ITaskQuery) => {
  const filter: any = { userId: new Types.ObjectId(userId) };

  const taskQuery = new QueryBuilder(
    Task.find(filter),
    query as Record<string, unknown>,
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await taskQuery.countTotal();
  const result = await taskQuery.modelQuery.lean();

  return {
    meta,
    result,
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
