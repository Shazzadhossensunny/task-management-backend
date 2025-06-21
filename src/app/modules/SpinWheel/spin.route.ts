import { Router } from 'express';
import { SpinControllers } from './spin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SpinValidation } from './spin.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.interface';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(SpinValidation.spinWheelValidationSchema),
  SpinControllers.spinWheel,
);

router.post(
  '/complete',
  auth(USER_ROLE.user),
  validateRequest(SpinValidation.completeSpinValidationSchema),
  SpinControllers.completeSpin,
);

router.get(
  '/history',
  auth(USER_ROLE.user),
  validateRequest(SpinValidation.getSpinHistoryValidationSchema),
  SpinControllers.getSpinHistory,
);

router.get('/pending', auth(USER_ROLE.user), SpinControllers.getPendingSpins);

router.get(
  '/stats/category',
  auth(USER_ROLE.user),
  SpinControllers.getSpinsByCategory,
);

router.delete('/:id', auth(USER_ROLE.user), SpinControllers.deleteSpinResult);

export default router;
