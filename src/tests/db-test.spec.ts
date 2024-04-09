import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new pool instance
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
});

// Define the test suite
describe('Database Connection', () => {
  // Define an individual test case
  it('should connect to the database successfully', (done) => {
    pool.query('SELECT NOW()', (err, res) => {
      // Handle errors
      if (err) {
        console.error('Error testing the database connection', err.stack);
        expect(err).toBeNull(); // Fail the test if there's an error
      } else {
        console.log('Database connection successful:', res.rows[0]);
        expect(res.rows[0]).toBeDefined(); // Pass the test if there's a successful response
      }
      pool.end(); // Close the pool
      done(); // Signal Jasmine that the asynchronous test is complete
    });
  });
});
