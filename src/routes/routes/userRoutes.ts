import { Router } from 'express';
import * as usersController from '../../controllers/usersController';

const router = Router();

router.get('/', usersController.index); // Get all users
// router.post('/', usersController.create); // Create a new user
// Add more routes as needed

export default router;
