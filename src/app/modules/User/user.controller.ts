import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User registered successfully!',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await UserServices.getUserProfile(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await UserServices.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await UserServices.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await UserServices.getAllUsers(page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully!',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const result = await UserServices.updateUserStatus(userId, isActive);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User status updated successfully!',
    data: result,
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await UserServices.getUserStats(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User stats retrieved successfully!',
    data: result,
  });
});

const addPointsToUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { points } = req.body;

  const result = await UserServices.addPointsToUser(userId, points);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Points added successfully!',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserServices.deleteUser(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully!',
    data: result,
  });
});

export const UserControllers = {
  registerUser,
  getUserProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  getUserStats,
  addPointsToUser,
  deleteUser,
};
