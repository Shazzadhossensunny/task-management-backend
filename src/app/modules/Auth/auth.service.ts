import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import AppError from '../../errors/AppError';
import {
  TLoginUser,
  TForgotPassword,
  TResetPassword,
  TJwtPayload,
} from './auth.interface';

import config from '../../config';

import type { StringValue } from 'ms';
import { User } from '../User/user.model';
import { createToken, verifyToken } from './auth.utlis';

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Your account has been deactivated. Please contact support.',
    );
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const jwtPayload: TJwtPayload = {
    role: user.role,
    email: user.email,
    userId: user._id.toString(),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as StringValue,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as StringValue,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      profileImage: user.profileImage,
    },
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(
    token,
    config.jwt_refresh_secret as string,
  ) as TJwtPayload;

  const { email, userId, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is deactivated');
  }

  // Check if password was changed after token was issued (optional)
  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload: TJwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as StringValue,
  );

  return {
    accessToken,
  };
};

const forgotPassword = async (payload: TForgotPassword) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found with this email');
  }

  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is deactivated');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set reset token and expiry (10 minutes)
  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // In production, you would send this via email
  // For now, returning the token (remove this in production)
  return {
    message: 'Password reset token sent to email',
    resetToken, // Remove this in production
  };
};

const resetPassword = async (payload: TResetPassword) => {
  // Check if passwords match
  if (payload.newPassword !== payload.confirmPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Passwords do not match');
  }

  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(payload.token)
    .digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    email: payload.email,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Invalid or expired reset token',
    );
  }

  // Update password
  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return {
    message: 'Password reset successfully',
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
};
