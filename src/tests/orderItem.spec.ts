import { OrderItem, OrderItemModel } from '../models/orderItem';
import { pool } from '../dbConfig/db';
import { createUserForTest, clearUserTestData } from './userModel.spec';
import { createOrderForTest, clearOrderTestData } from './orderModel.spec';
import {
  createProductForTest,
  clearProductTestData,
} from './productModel.spec';

const orderItemModel = new OrderItemModel();

/**
 * Clears all order item data from the database to ensure tests start with a clean state.
 */
const clearOrderItemTestData = async () => {
  await pool.query('DELETE FROM order_items');
};

/**
 * Creates an order item in the database for testing, linked to an order and a product.
 * @param order_id The ID of the order the item belongs to.
 * @param product_id The ID of the product the order item is for.
 * @param quantity The quantity of the product in the order item.
 * @returns The created order item.
 */
const createOrderItemForTest = async (
  order_id: number,
  product_id: number,
  quantity: number,
): Promise<OrderItem> => {
  return orderItemModel.create(order_id, product_id, quantity);
};

describe('OrderItem Model', () => {
  // Clear all relevant test data before and after each test
  beforeEach(async () => {
    await clearOrderItemTestData();
    await clearOrderTestData();
    await clearProductTestData();
    await clearUserTestData();
  });

  afterEach(async () => {
    await clearOrderItemTestData();
    await clearOrderTestData();
    await clearProductTestData();
    await clearUserTestData();
  });

  // Test suite for creating order items
  describe('Create method', () => {
    it('should add an order item', async () => {
      // Set up necessary data: user, order, and product
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();

      // Create an order item and verify its properties
      const result = await createOrderItemForTest(order.id, product.id, 5);
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          order_id: order.id,
          product_id: product.id,
          quantity: 5,
        }),
      );
    });
  });

  // Test suite for retrieving all order items
  describe('Index method', () => {
    it('should return an array of order items', async () => {
      // Set up necessary data and create an order item
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();
      await createOrderItemForTest(order.id, product.id, 5);

      // Retrieve all order items and verify the result
      const orderItems = await orderItemModel.index();
      expect(Array.isArray(orderItems)).toBeTrue();
      expect(orderItems.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Test suite for retrieving a specific order item by ID
  describe('Show method', () => {
    it('should return the correct order item by id', async () => {
      // Set up necessary data and create an order item
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();
      const newOrderItem = await createOrderItemForTest(
        order.id,
        product.id,
        5,
      );

      // Retrieve the created order item by its ID and verify its properties
      const foundOrderItem = await orderItemModel.show(newOrderItem.id);
      expect(foundOrderItem).toEqual(
        jasmine.objectContaining({
          id: newOrderItem.id,
          order_id: order.id,
          product_id: product.id,
          quantity: 5,
        }),
      );
    });
  });

  // Test suite for updating order items
  describe('Update method', () => {
    it('should update the order item details', async () => {
      // Set up necessary data and create an order item
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();
      const orderItem = await createOrderItemForTest(order.id, product.id, 5);

      // Update the order item and verify the updated properties
      const updatedOrderItem = await orderItemModel.update(
        orderItem.id,
        order.id,
        product.id,
        10,
      );
      expect(updatedOrderItem).toEqual(
        jasmine.objectContaining({
          id: orderItem.id,
          order_id: order.id,
          product_id: product.id,
          quantity: 10,
        }),
      );
    });
  });

  // Test suite for deleting order items
  describe('Delete method', () => {
    it('should delete the order item and confirm it no longer exists', async () => {
      // Set up necessary data and create an order item
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();
      const orderItemToDelete = await createOrderItemForTest(
        order.id,
        product.id,
        5,
      );

      // Delete the order item and verify it was deleted
      const deletedOrderItem = await orderItemModel.delete(
        orderItemToDelete.id,
      );
      expect(deletedOrderItem.id).toBe(orderItemToDelete.id);

      // Verify that the deleted order item no longer exists
      const result = await orderItemModel.show(orderItemToDelete.id);
      expect(result).toBeUndefined();
    });
  });

  describe('getByOrderId method', () => {
    it('should return all order items for a given order ID', async () => {
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');
      const product = await createProductForTest();

      // Create multiple order items for the order
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [order.id, product.id, 5],
      );
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [order.id, product.id, 3],
      );

      const orderItems = await orderItemModel.getByOrderId(order.id);

      expect(orderItems.length).toBeGreaterThanOrEqual(2);
      orderItems.forEach((orderItem) => {
        expect(orderItem.order_id).toEqual(order.id);
      });
    });

    it('should return an empty array if no order items exist for the given order ID', async () => {
      const nonExistingOrderId = 9999; // Assuming this ID does not exist
      const orderItems = await orderItemModel.getByOrderId(nonExistingOrderId);
      expect(orderItems).toEqual([]);
    });
  });
});
