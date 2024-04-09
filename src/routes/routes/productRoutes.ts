import { Router } from 'express';
import * as productsController from '../../controllers/productsController';

const router = Router();

router.get('/', productsController.index); // Get all products
//router.get('/:id', productsController.show); // Get a single product by ID
//router.post('/', productsController.create); // Create a new product
// Add more routes as needed

export default router;
