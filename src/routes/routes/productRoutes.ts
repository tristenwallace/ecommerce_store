import { Router } from 'express';
import * as productsController from '../../controllers/productsController';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', productsController.index);
router.get('/:id', productsController.show);
router.post('/', [authenticateToken, isAdmin], productsController.create);

export default router;
