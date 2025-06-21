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

  const taskFilter: any = {
    userId: new Types.ObjectId(userId),
    status: { $ne: 'done' },
  };

  if (categories.length > 0) {
    taskFilter.category = { $in: categories };
  }

  if (excludeCompleted) {
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
      'No available tasks to spin. Try creating new tasks or completing existing spins.',
    );
  }

  const randomIndex = Math.floor(Math.random() * availableTasks.length);
  const selectedTask = availableTasks[randomIndex];

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
    message: `You spun ${selectedTask.category.replace('-', ' & ')} category! Complete this task to earn ${selectedTask.points} points.`,
  };
};

export const completeSpin = async (
  userId: string,
  spinResultId: string,
): Promise<ISpinResult> => {
  if (!Types.ObjectId.isValid(spinResultId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid spin result ID');
  }

  const spinResult = await SpinResult.findOne({
    _id: new Types.ObjectId(spinResultId),
    userId: new Types.ObjectId(userId),
    isCompleted: false,
  }).populate('taskId');

  if (!spinResult) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Spin result not found or already completed',
    );
  }

  const task = await Task.findById(spinResult.taskId);
  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Associated task not found');
  }

  task.status = 'done';
  await task.save();

  spinResult.isCompleted = true;
  spinResult.completedAt = new Date();
  spinResult.pointsEarned = task.points;
  await spinResult.save();

  return spinResult;
};

export const getSpinHistory = async (
  userId: string,
  query: any,
): Promise<ISpinHistory> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId: new Types.ObjectId(userId) };

  if (query.category) filter.category = query.category;
  if (query.completed !== undefined) {
    filter.isCompleted = query.completed === 'true';
  }

  const [spinResults, totalSpins] = await Promise.all([
    SpinResult.find(filter)
      .populate({
        path: 'taskId',
        select: 'title description category points status',
      })
      .sort({ spinDate: -1 })
      .skip(skip)
      .limit(limit),
    SpinResult.countDocuments(filter),
  ]);

  const stats = await getSpinStats(userId);

  return {
    spinResults,
    stats: {
      totalSpins,
      ...stats,
    },
  };
};

export const getSpinStats = async (userId: string) => {
  const [completedSpins, totalPointsEarned, categoryStats] = await Promise.all([
    SpinResult.countDocuments({
      userId: new Types.ObjectId(userId),
      isCompleted: true,
    }),
    SpinResult.aggregate([
      { $match: { userId: new Types.ObjectId(userId), isCompleted: true } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } },
    ]),
    SpinResult.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  const totalPoints = totalPointsEarned[0]?.total || 0;
  const favoriteCategory = categoryStats[0]?._id || 'none';

  return {
    completedSpins,
    totalPointsEarned: totalPoints,
    favoriteCategory,
  };
};

export const getPendingSpins = async (
  userId: string,
): Promise<ISpinResult[]> => {
  return SpinResult.find({
    userId: new Types.ObjectId(userId),
    isCompleted: false,
  })
    .populate({
      path: 'taskId',
      select: 'title description category points status',
    })
    .sort({ spinDate: -1 });
};

export const getSpinsByCategory = async (userId: string): Promise<any> => {
  return SpinResult.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        totalSpins: { $sum: 1 },
        completedSpins: {
          $sum: { $cond: ['$isCompleted', 1, 0] },
        },
        totalPoints: {
          $sum: { $cond: ['$isCompleted', '$pointsEarned', 0] },
        },
      },
    },
    {
      $project: {
        category: '$_id',
        totalSpins: 1,
        completedSpins: 1,
        totalPoints: 1,
        completionRate: {
          $multiply: [{ $divide: ['$completedSpins', '$totalSpins'] }, 100],
        },
      },
    },
    { $sort: { totalSpins: -1 } },
  ]);
};

export const deleteSpinResult = async (
  userId: string,
  spinResultId: string,
): Promise<void> => {
  if (!Types.ObjectId.isValid(spinResultId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid spin result ID');
  }

  const spinResult = await SpinResult.findOneAndDelete({
    _id: new Types.ObjectId(spinResultId),
    userId: new Types.ObjectId(userId),
    isCompleted: false,
  });

  if (!spinResult) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Spin result not found or cannot be deleted',
    );
  }
};

export const SpinServices = {
  spinWheel,
  completeSpin,
  getSpinHistory,
  getSpinStats,
  getPendingSpins,
  getSpinsByCategory,
  deleteSpinResult,
};
