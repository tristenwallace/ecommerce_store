import { Request, Response } from 'express';
import { OrderModel } from '../models/order';
import { OrderItemModel } from '../models/orderItem';

const orderModel = new OrderModel();
const orderItemModel = new OrderItemModel();

export const getCurrentOrder = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const order = await orderModel.getCurrentOrderForUser(userId);
    if (order) {
      const orderItems = await orderItemModel.getByOrderId(order.id);
      res.json({ order, items: orderItems });
    } else {
      res.status(404).json({ error: 'No current order found for this user' });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, items } = req.body; // Assuming items is an array of { product_id, quantity }

    // Create a new order
    const newOrder = await orderModel.create(userId, status);

    // Add each item to the order
    const addedItems = await Promise.all(
      items.map(async (item: { product_id: number; quantity: number }) => {
        return orderItemModel.create(
          newOrder.id,
          item.product_id,
          item.quantity,
        );
      }),
    );

    res.json({ order: newOrder, items: addedItems });
  } catch (err) {
    res.status(500).json({ err });
  }
};
