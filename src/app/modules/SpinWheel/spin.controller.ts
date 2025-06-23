import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SpinServices } from './spin.service';

const spinWheel = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const { categories, excludeCompleted } = req.body;

  // Validate input
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: 'Please select at least one category to spin the wheel',
      data: null,
    });
  }

  const result = await SpinServices.spinWheel(userId, {
    categories,
    excludeCompleted,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const SpinControllers = {
  spinWheel,
};
