export type TLoginUser = {
  email: string;
  password: string;
};

export type TResetPassword = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  token: string;
};

export type TForgotPassword = {
  email: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type TJwtPayload = {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
};

export type TTokens = {
  accessToken: string;
  refreshToken: string;
};
