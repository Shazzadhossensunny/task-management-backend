import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import {
  TRegisterUser,
  TUpdateProfile,
  TUserStats,
  TChangePassword,
} from './user.interface';
import { User } from './user.model';

const registerUser = async (payload: TRegisterUser) => {
  // Check if passwords match
  // if (payload.password !== payload.confirmPassword) {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'Passwords do not match');
  // }

  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'User already exists with this email',
    );
  }

  const result = await User.create(payload);

  // Return user without password
  const user = await User.findById(result._id).select('-password');
  return user;
};

const getUserProfile = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const updateProfile = async (userId: string, payload: TUpdateProfile) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

const changePassword = async (userId: string, payload: TChangePassword) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  // Check if passwords match
  // if (payload.newPassword !== payload.confirmPassword) {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'New passwords do not match');
  // }

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Verify old password
  const isOldPasswordValid = await User.isPasswordMatched(
    payload.oldPassword,
    user.password,
  );

  if (!isOldPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Old password is incorrect');
  }

  // Update password
  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  return { message: 'Password changed successfully' };
};

const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const users = await User.find({ role: 'user' })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ role: 'user' });

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

const updateUserStatus = async (userId: string, isActive: boolean) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  ).select('-password');

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserStats = async (userId: string): Promise<TUserStats> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  const user = await User.findById(userId).select('points');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  try {
    // Import Task model here to avoid circular dependency
    const { Task } = await import('../Task/task.model');

    const taskStats = await Task.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats: TUserStats = {
      totalPoints: user.points,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
    };

    taskStats.forEach((stat) => {
      stats.totalTasks += stat.count;
      if (stat._id === 'done') stats.completedTasks = stat.count;
      if (stat._id === 'pending') stats.pendingTasks = stat.count;
      if (stat._id === 'inprogress') stats.inProgressTasks = stat.count;
    });

    return stats;
  } catch (error) {
    // If Task model doesn't exist, return stats with only points
    return {
      totalPoints: user.points,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
    };
  }
};

const addPointsToUser = async (userId: string, points: number) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  if (points <= 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Points must be greater than 0',
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points: points } },
    { new: true },
  ).select('-password');

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

const deleteUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return { message: 'User deleted successfully' };
};

export const UserServices = {
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
