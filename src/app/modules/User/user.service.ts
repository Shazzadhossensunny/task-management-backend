import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TRegisterUser, TUpdateProfile, TUser } from './user.interface';
import { User } from './user.model';
import { TChangePassword } from '../Auth/auth.interface';

const registerUser = async (payload: TRegisterUser) => {
  // Check if passwords match
  if (payload.password !== payload.confirmPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Passwords do not match');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'User already exists with this email',
    );
  }

  // Create new user
  const userData = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  };

  const result = await User.create(userData);
  return result;
};

const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const updateProfile = async (userId: string, payload: TUpdateProfile) => {
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
  // Check if passwords match
  if (payload.newPassword !== payload.confirmPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'New passwords do not match');
  }

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

const getAllUsers = async () => {
  const users = await User.find({ role: 'user' }).select('-password');
  return users;
};

const updateUserStatus = async (userId: string, isActive: boolean) => {
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

const getUserStats = async (userId: string) => {
  const user = await User.findById(userId).select('points');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // You can add more stats here like total tasks, completed tasks, etc.
  return {
    totalPoints: user.points,
    // Add more stats as needed
  };
};

export const UserServices = {
  registerUser,
  getUserProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserStatus,
  getUserStats,
};
