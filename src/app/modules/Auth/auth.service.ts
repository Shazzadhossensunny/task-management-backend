import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import {
  TLoginUser,
  TForgotPassword,
  TResetPassword,
  TJwtPayload,
} from './auth.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';

import config from '../../config';

import type { StringValue } from 'ms';
import { User } from '../User/user.model';
import { createToken, verifyToken } from './auth.utlis';
import { sendEmail } from '../../utils/email';

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

const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Create JWT payload with EMAIL instead of userId
  const jwtPayload = {
    email: user.email, // Store email instead of userId
    role: user.role,
    userId: user._id.toString(),
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?token=${resetToken}`;

  await sendEmail(user.email, resetUILink);

  return { message: 'Password reset link sent to your email' };
};
const resetPassword = async (
  payload: { newPassword: string }, // Remove id from payload
  token: string,
) => {
  // Verify token
  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  // Extract email from token
  const email = decoded.email;
  if (!email) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid reset token');
  }

  // Find user by EMAIL
  const user = await User.findOne({ email });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round),
  );

  // Update user
  await User.findOneAndUpdate(
    { email },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return { message: 'Password reset successfully' };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  forgetPassword,
  resetPassword,
};
