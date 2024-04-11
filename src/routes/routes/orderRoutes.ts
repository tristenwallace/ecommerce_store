import { Router } from 'express';
import * as ordersController from '../../controllers/ordersController';
import {
  authenticateToken,
  isAdminOrCurrentUser,
} from '../../middleware/authMiddleware';

const router = Router();

router.get(
  '/current/:userId',
  [authenticateToken, isAdminOrCurrentUser],
  ordersController.getCurrentOrder,
);
router.post(
  '/:userId',
  [authenticateToken, isAdminOrCurrentUser],
  ordersController.create,
);

export default router;
