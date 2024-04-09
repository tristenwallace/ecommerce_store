// database-config.js
const dotenv = require('dotenv');

// Determine which .env file to load based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';

// Load the environment variables from the specified file
dotenv.config({ path: envFile });

const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  database: process.env.POSTGRES_NAME,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

module.exports = dbConfig;
