import { Request, Response } from 'express';
import { OrderModel } from '../models/order';
import { OrderItem, OrderItemModel } from '../models/orderItem';

// Instantiate models to interact with the database
const orderModel = new OrderModel();
const orderItemModel = new OrderItemModel();

/**
 * Fetches the current (most recent and not completed) order for a specific user.
 *
 * @param {Request} req - The request object containing route parameters.
 * @param {Response} res - The response object used to return data or errors.
 */
export const getCurrentOrder = async (req: Request, res: Response) => {
  // Extract and parse the user ID from request parameters
  const userId: number = parseInt(req.params.userId);
  try {
    // Retrieve the current order for the specified user
    const order = await orderModel.getCurrentOrderForUser(userId);

    if (order) {
      // If an order is found, fetch associated order items
      const orderItems = await orderItemModel.getByOrderId(order.id);
      // Respond with the order and its items
      res.json({ order, items: orderItems });
    } else {
      // If no current order is found, respond with a 404 error
      res.status(404).json({ error: 'No current order found for this user' });
    }
  } catch (err) {
    // Log and respond with errors if the process fails
    console.error(`Error fetching current order for user ID: ${userId}:`, err);
    res.status(500).json({ err });
  }
};

/**
 * Creates a new order for a specified user with optional order items.
 *
 * @param {Request} req - The request object containing the user ID and body data.
 * @param {Response} res - The response object used to return data or errors.
 */
export const create = async (req: Request, res: Response) => {
  // Extract and parse the user ID from request parameters
  const userId = parseInt(req.params.userId);
  try {
    // Extract order status and items from the request body
    const { status, items } = req.body;

    // Create a new order with the specified status
    const newOrder = await orderModel.create(userId, status);

    // Add each item to the newly created order and collect the results
    const addedItems = await Promise.all(
      items.map(async (item: OrderItem) => {
        return orderItemModel.create(
          newOrder.id,
          item.product_id,
          item.quantity,
        );
      }),
    );

    // Respond with the new order and added items
    res.json({ order: newOrder, items: addedItems });
  } catch (err) {
    // Log and respond with errors if the order creation process fails
    console.error(`Error creating order for user ID: ${userId}:`, err);
    res.status(500).json({ err });
  }
};
