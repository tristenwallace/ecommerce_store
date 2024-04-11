import request from 'supertest';
import app from '../server';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

// Test suite for User endpoints
describe('Users Endpoint', () => {
  let adminToken: string; // Holds the admin token for authorized requests
  let testUserId: number; // Holds the user ID for the test user

  // Runs before each test in this suite
  beforeEach(async () => {
    // Hash a password for creating an admin user
    const adminPassword = 'adminPassword';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Insert a test admin user into the database
    const userInsert = await pool.query(
      'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id',
      ['testuser', 'test@example.com', hashedPassword, true],
    );
    testUserId = userInsert.rows[0].id; // Store the test user ID for use in tests

    // Authenticate the test user to obtain an admin token
    const loginResponse = await request(app).post('/login').send({
      username: 'testuser',
      password: adminPassword,
    });
    adminToken = loginResponse.body.token; // Store the admin token
  });

  // Runs after each test in this suite
  afterEach(async () => {
    // Delete the test user from the database
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  // Test for fetching a specific user by ID
  describe('GET /users/:id', () => {
    it('should fetch a specific user by ID', async () => {
      // Make a GET request to fetch the test user by their ID
      const response = await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Assertions to verify the response
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testUserId);
      expect(response.body.username).toBe('testuser');
    });
  });

  // Test for creating a new user
  describe('POST /users', () => {
    it('should create a new user', async () => {
      // Define the new user to be created
      const newUser = {
        username: 'newUser',
        email: 'newuser@example.com',
        password: 'newPassword',
      };

      // Make a POST request to create a new user
      const response = await request(app).post('/users').send(newUser);

      // Assertions to verify the response
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.email).toBe(newUser.email);
    });
  });

  // Test for fetching all users
  describe('GET /users', () => {
    it('should fetch all users', async () => {
      // Make a GET request to fetch all users
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      // Assertions to verify the response
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
    });
  });
});
