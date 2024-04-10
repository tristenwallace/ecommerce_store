import { Router } from 'express';
import * as usersController from '../../controllers/usersController';
import {
  authenticateToken,
  isAdmin,
  isAdminOrCurrentUser,
} from '../../middleware/authMiddleware';

const router = Router();

router.get('/', [authenticateToken, isAdmin], usersController.index);
router.get(
  '/:id',
  [authenticateToken, isAdminOrCurrentUser],
  usersController.show,
);
router.post('/', usersController.create);

export default router;
