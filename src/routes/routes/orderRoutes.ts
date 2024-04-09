import { Router } from 'express';
import * as ordersController from '../../controllers/ordersController';

const router = Router();

router.get('/', ordersController.index); // Get all products
//router.get('/current/:userId', ordersController.getCurrentOrder); // Get current order for a user
// Add more routes as needed

export default router;
