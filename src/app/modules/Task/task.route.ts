import { Router } from 'express';
import { TaskControllers } from './task.controller';
import validateRequest from '../../middlewares/validateRequest';
import { TaskValidation } from './task.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.interface';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(TaskValidation.createTaskValidationSchema),
  TaskControllers.createTask,
);

router.get(
  '/',
  auth(USER_ROLE.user),
  validateRequest(TaskValidation.getTasksValidationSchema),
  TaskControllers.getTasks,
);

router.get('/stats', auth(USER_ROLE.user), TaskControllers.getTaskStats);

router.get(
  '/category/:category',
  auth(USER_ROLE.user),
  TaskControllers.getTasksByCategory,
);

router.get('/:id', auth(USER_ROLE.user), TaskControllers.getTaskById);

router.put(
  '/:id',
  auth(USER_ROLE.user),
  validateRequest(TaskValidation.updateTaskValidationSchema),
  TaskControllers.updateTask,
);

router.patch(
  '/:id/status',
  auth(USER_ROLE.user),
  validateRequest(TaskValidation.updateTaskStatusValidationSchema),
  TaskControllers.updateTaskStatus,
);

router.delete('/:id', auth(USER_ROLE.user), TaskControllers.deleteTask);

export default router;
