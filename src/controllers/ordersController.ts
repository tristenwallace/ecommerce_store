import { Request, Response } from 'express';
import { OrderModel } from '../models/order';

const orderModel = new OrderModel();

export const index = async (req: Request, res: Response) => {
  try {
    const orders = await orderModel.index();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Implement other handlers like 'show', 'create', etc.
