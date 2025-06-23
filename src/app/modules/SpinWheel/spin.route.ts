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

export const SpinRoutes = router;
