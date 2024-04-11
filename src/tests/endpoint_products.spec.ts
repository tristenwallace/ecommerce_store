import request from 'supertest';
import app from '../server';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';
import { createProductForTest } from './model_product.spec';

describe('Products Endpoint', () => {
  let adminToken: string; // Token used to authenticate admin requests
  let testProductId: number; // ID of the test product inserted in the database

  beforeAll(async () => {
    // Hash admin password before inserting into the database for test setup
    const adminPassword = 'adminPassword';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Insert an admin user into the database for testing purposes
    await pool.query(
      'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4)',
      ['adminuser', 'admin@example.com', hashedPassword, true],
    );

    // Authenticate as the admin user to obtain a JWT token for admin actions
    const response = await request(app)
      .post('/login')
      .send({ username: 'adminuser', password: adminPassword });
    adminToken = response.body.token; // Store the JWT token for later use in tests

    // Insert a test product into the database and store its ID for retrieval tests
    const result = await createProductForTest();
    testProductId = result.id;
  });

  afterAll(async () => {
    // Clean up database by removing the test product and admin user created for tests
    await pool.query('DELETE FROM products WHERE name = $1', ['Test Product']);
    await pool.query('DELETE FROM users WHERE username = $1', ['adminuser']);
  });

  // Test suite for retrieving all products
  describe('GET /products', () => {
    it('should fetch all products', async () => {
      const response = await request(app).get('/products');
      expect(response.status).toBe(200); // Expect HTTP status 200 for successful retrieval
      expect(Array.isArray(response.body)).toBeTrue(); // Ensure the response is an array of products
    });
  });

  // Test suite for retrieving a single product by its ID
  describe('GET /products/:id', () => {
    it('should fetch a single product by ID', async () => {
      const response = await request(app).get(`/products/${testProductId}`);
      expect(response.status).toBe(200); // Expect HTTP status 200 for successful retrieval
      expect(response.body.id).toBe(testProductId); // Ensure the retrieved product has the correct ID
    });
  });

  // Test suite for creating a new product (admin only action)
  describe('POST /products', () => {
    it('should create a new product (Admin only)', async () => {
      const newProduct = {
        name: 'New Product',
        price: 10.99,
        category: 'TestCategory',
      };

      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`) // Use the admin JWT token for authorization
        .send(newProduct);

      expect(response.status).toBe(200); // Expect HTTP status 200 for successful creation
      expect(response.body.name).toBe(newProduct.name); // Ensure the created product matches the request data
    });
  });
});
