import express from 'express';
export const routes = express.Router();
import productsRoutes from './routes/productRoutes';
import usersRoutes from './routes/userRoutes';
import ordersRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';

// Root route definition
routes.get('/', (req, res) => {
  // Sends a simple response for the root route
  res.send('main api route');
});

// Use the defined routes
routes.use('/products', productsRoutes);
routes.use('/users', usersRoutes);
routes.use('/orders', ordersRoutes);
routes.use('/login', authRoutes);
