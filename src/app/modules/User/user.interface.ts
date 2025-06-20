export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type TUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  points: number;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
};

export type TUpdateProfile = {
  name?: string;
  profileImage?: string;
};
