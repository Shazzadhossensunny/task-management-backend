import { Router } from 'express';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.interface';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest(UserValidation.registerUserValidationSchema),
  UserControllers.registerUser,
);

// Protected routes (require authentication)
router.get(
  '/profile',
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUserProfile,
);

router.patch(
  '/profile',
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserControllers.updateProfile,
);

router.patch(
  '/change-password',
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(UserValidation.changePasswordValidationSchema),
  UserControllers.changePassword,
);

router.get(
  '/stats',
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUserStats,
);

// Admin only routes
router.get(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.getUsersValidationSchema),
  UserControllers.getAllUsers,
);

router.patch(
  '/:userId/status',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserControllers.updateUserStatus,
);

router.patch(
  '/:userId/points',
  auth(USER_ROLE.admin),
  validateRequest(UserValidation.addPointsValidationSchema),
  UserControllers.addPointsToUser,
);

router.delete('/:userId', auth(USER_ROLE.admin), UserControllers.deleteUser);

export const UserRoutes = router;
