import { Order, OrderModel } from '../models/order';
import { pool } from '../dbConfig/db';
import { createUserForTest, clearUserTestData } from './userModel.spec';

const orderModel = new OrderModel();

// Helper function to clear order test data from the database.
export const clearOrderTestData = async () => {
  await pool.query('DELETE FROM orders');
};

// Helper function to create a test order in the database.
// This simplifies the process of setting up test conditions.
export const createOrderForTest = async (
  userId: number,
  status: string,
): Promise<Order> => {
  return orderModel.create(userId, status);
};

describe('Order Model', () => {
  // Clears test data before each test runs to ensure a clean state.
  beforeEach(async () => {
    await clearOrderTestData();
    await clearUserTestData();
  });

  // Clears test data after each test completes to clean up and avoid test data pollution.
  afterEach(async () => {
    await clearOrderTestData();
    await clearUserTestData();
  });

  // Tests the functionality of the create method in the OrderModel.
  describe('Create method', () => {
    it('should add an order', async () => {
      // Setup: Create a user to associate with the order.
      const user = await createUserForTest();

      // Execution: Create an order for the user and verify the result.
      const result = await createOrderForTest(user.id, 'active');

      // Assertion: Check that the created order has the expected properties.
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          user_id: user.id,
          status: 'active',
        }),
      );
    });
  });

  // Tests that the index method returns an array of orders.
  describe('Index method', () => {
    it('should return an array of orders', async () => {
      // Setup: Ensure at least one order exists by creating a user and an order.
      const user = await createUserForTest();
      await createOrderForTest(user.id, 'active');

      // Execution: Retrieve all orders and verify the result.
      const orders = await orderModel.index();

      // Assertion: Check that the result is an array and contains at least one order.
      expect(Array.isArray(orders)).toBeTrue();
      expect(orders.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Tests the show method's ability to retrieve a single order by its ID.
  describe('Show method', () => {
    it('should return the correct order by id', async () => {
      // Setup: Create a user and an order to test the retrieval.
      const user = await createUserForTest();
      const newOrder = await createOrderForTest(user.id, 'active');

      // Execution: Retrieve the order by its ID and verify the result.
      const foundOrder = await orderModel.show(newOrder.id);

      // Assertion: Check that the retrieved order matches the created order.
      expect(foundOrder).toEqual(
        jasmine.objectContaining({
          id: newOrder.id,
          user_id: user.id,
          status: 'active',
        }),
      );
    });
  });

  // Tests the update method's ability to change an order's status.
  describe('Update method', () => {
    it('should update the order status', async () => {
      // Setup: Create a user and an order to test the update functionality.
      const user = await createUserForTest();
      const order = await createOrderForTest(user.id, 'active');

      // Execution: Update the order's status and verify the result.
      const updatedOrder = await orderModel.update(
        order.id,
        user.id,
        'completed',
      );

      // Assertion: Check that the order's status has been updated as expected.
      expect(updatedOrder).toEqual(
        jasmine.objectContaining({
          id: order.id,
          user_id: user.id,
          status: 'completed',
        }),
      );
    });
  });

  // Tests the delete method's ability to remove an order from the database.
  describe('Delete method', () => {
    it('should delete the order and confirm it no longer exists', async () => {
      // Setup: Create a user and an order to test the deletion.
      const user = await createUserForTest();
      const orderToDelete = await createOrderForTest(user.id, 'active');

      // Execution: Delete the order and attempt to retrieve it.
      const deletedOrder = await orderModel.delete(orderToDelete.id);

      // Assertion 1: Check that the deleted order's ID matches the expected ID.
      expect(deletedOrder.id).toBe(orderToDelete.id);

      // Assertion 2: Attempt to fetch the deleted order and expect it to not exist.
      const result = await orderModel.show(orderToDelete.id);
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentOrderForUser method', () => {
    let userId: number;

    // Setup a user and multiple orders for that user before each test
    beforeEach(async () => {
      // Clear any existing data
      await clearUserTestData();
      await pool.query('DELETE FROM orders');

      // Create a test user and get their ID
      const user = await createUserForTest();
      userId = user.id;

      // Create multiple orders for the test user, including a 'completed' order and a non-completed 'active' order
      await createOrderForTest(userId, 'completed');
      await createOrderForTest(userId, 'active');
      await createOrderForTest(userId, 'completed');
    });

    // Ensure database is clean after tests run
    afterEach(async () => {
      await pool.query('DELETE FROM orders');
      await clearUserTestData();
    });

    it('should return the most recent non-completed order for a given user', async () => {
      const currentOrder = await orderModel.getCurrentOrderForUser(userId);

      // Expectations: The current order should exist and have a status other than 'completed'
      expect(currentOrder).toBeDefined();
      expect(currentOrder.status).not.toEqual('completed');
      expect(currentOrder.user_id).toEqual(userId);
    });

    it('should return undefined if there is no current order for the user', async () => {
      // Deleting non-completed orders to simulate no current order
      await pool.query(
        "DELETE FROM orders WHERE user_id = $1 AND status != 'completed'",
        [userId],
      );

      const currentOrder = await orderModel.getCurrentOrderForUser(userId);

      // Expectation: There should be no current order, so the result should be undefined
      expect(currentOrder).toBeUndefined();
    });
  });
});
