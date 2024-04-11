import request from 'supertest';
import app from '../server';
import { createUserForTest, clearUserTestData } from './model_user.spec';

beforeEach(async () => {
  // Clears user data before each test for a clean testing environment
  await clearUserTestData();
});

afterEach(async () => {
  // Optionally clears user data after each test to prevent data pollution
  await clearUserTestData();
});

describe('Auth Controller', () => {
  describe('POST /login', () => {
    it('should return a JWT token for valid credentials', async () => {
      // Create "testusername" w/ pass: "password123"
      await createUserForTest();

      const response = await request(app)
        .post('/login') // Specify the route to test
        .send({
          username: 'testusername',
          password: 'password123',
        });

      expect(response.status).toBe(200); // Expect a 200 OK response
      expect(response.body.token).toBeDefined(); // Check if token is defined
      expect(typeof response.body.token).toBe('string'); // Check if token is a string
    });

    it('should return a 401 error for invalid credentials', async () => {
      const response = await request(app).post('/login').send({
        username: 'invalidUser',
        password: 'invalidPassword',
      });

      expect(response.status).toBe(401); // Expect a 401 Unauthorized response
      expect(response.body.error).toEqual('Invalid username or password'); // Check the error message
    });
  });
});
