import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SpinServices } from './spin.service';

const spinWheel = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await SpinServices.spinWheel(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wheel spun successfully!',
    data: result,
  });
});

const completeSpin = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { spinResultId } = req.body;
  const result = await SpinServices.completeSpin(userId, spinResultId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Congratulations! You completed the task and earned ${result.pointsEarned} points!`,
    data: result,
  });
});

const getSpinHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await SpinServices.getSpinHistory(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Spin history retrieved successfully',
    data: result,
  });
});

const getPendingSpins = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await SpinServices.getPendingSpins(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Pending spins retrieved successfully',
    data: result,
  });
});

const getSpinsByCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await SpinServices.getSpinsByCategory(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Spin statistics by category retrieved successfully',
    data: result,
  });
});

const deleteSpinResult = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { id } = req.params;
  await SpinServices.deleteSpinResult(userId, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Spin result deleted successfully',
    data: null,
  });
});

export const SpinControllers = {
  spinWheel,
  completeSpin,
  getSpinHistory,
  getPendingSpins,
  getSpinsByCategory,
  deleteSpinResult,
};
