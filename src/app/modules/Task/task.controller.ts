import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TaskServices } from './task.service';

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.createTask({
    ...req.body,
    userId: req.user.userId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await TaskServices.getTasks(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    data: result,
  });
});

const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;
  const task = await TaskServices.getTaskById(userId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: task,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;
  const task = await TaskServices.updateTask(userId, id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;
  const { status } = req.body;
  const task = await TaskServices.updateTaskStatus(userId, id, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task status updated successfully',
    data: task,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;
  await TaskServices.deleteTask(userId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task deleted successfully',
    data: null,
  });
});

const getTaskStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const stats = await TaskServices.getTaskStats(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task statistics retrieved successfully',
    data: stats,
  });
});

const getTasksByCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { category } = req.params;
  const tasks = await TaskServices.getTasksByCategory(userId, category);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Tasks by category retrieved successfully',
    data: tasks,
  });
});

export const TaskControllers = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getTasksByCategory,
};
