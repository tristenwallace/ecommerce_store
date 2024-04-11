import { Router } from 'express';
import * as ordersController from '../../controllers/ordersController';
import {
  authenticateToken,
  isAdminOrCurrentUser,
} from '../../middleware/authMiddleware';

const router = Router();

router.get(
  '/current/:username',
  [authenticateToken, isAdminOrCurrentUser],
  ordersController.getCurrentOrder,
);
router.post(
  '/:username',
  [authenticateToken, isAdminOrCurrentUser],
  ordersController.create,
);

export default router;
