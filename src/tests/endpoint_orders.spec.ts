import request from 'supertest';
import app from '../server';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

describe('Orders Endpoint', () => {
  let adminToken: string; // Token for admin authentication
  let testUserId: number; // ID for the test user

  // Setup before each test
  beforeEach(async () => {
    // Hash password for admin user
    const adminPassword = 'adminPassword';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Insert a test user with admin privileges and store the returned ID
    const userInsert = await pool.query(
      'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id',
      ['testuser', 'test@example.com', hashedPassword, true],
    );
    testUserId = userInsert.rows[0].id;

    // Authenticate as the admin user to obtain an authentication token
    const loginResponse = await request(app).post('/login').send({
      username: 'testuser',
      password: adminPassword,
    });
    adminToken = loginResponse.body.token; // Store the token for use in test requests
  });

  // Cleanup after each test
  afterEach(async () => {
    // Delete orders and users created during the tests
    await pool.query('DELETE FROM orders WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  // Test for fetching the current order of a user
  describe('GET /orders/current/:userId', () => {
    it('should fetch the current order for the user', async () => {
      // Insert a test order for the test user
      await pool.query('INSERT INTO orders (user_id, status) VALUES ($1, $2)', [
        testUserId,
        'active',
      ]);

      // Request to fetch the current order for the test user
      const response = await request(app)
        .get(`/orders/current/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Expectations for the response
      expect(response.status).toBe(200);
      expect(response.body.order.user_id).toBe(testUserId);
      expect(response.body.order.status).toBe('active');
    });
  });

  // Test for creating a new order for a user
  describe('POST /orders/:userId', () => {
    it('should create a new order for the user', async () => {
      // Request to create a new order for the test user
      const response = await request(app)
        .post(`/orders/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active', items: [] }); // Assuming items are empty for simplicity

      // Expectations for the response
      expect(response.status).toBe(200);
      expect(response.body.order.user_id).toBe(testUserId);
      expect(response.body.order.status).toBe('active');
    });
  });
});
