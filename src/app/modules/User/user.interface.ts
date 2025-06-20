import { Document, Types } from 'mongoose';

export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
} as const;

export const UserSearchableFields = ['email', 'role'];

export type TUserRole = 'admin' | 'user';

export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: TUserRole;
  isActive: boolean;
  points: number;
  profileImage?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  addPoints(points: number): Promise<IUser>;
}

export interface IUserModel extends Document {
  isUserExistsByEmail(email: string): Promise<IUser | null>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUser = IUser & IUserMethods;

export type TUpdateProfile = {
  name?: string;
  profileImage?: string;
};

export type TUserStats = {
  totalPoints: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
