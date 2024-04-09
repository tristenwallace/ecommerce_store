// database-config.js
require('dotenv').config();

const databaseConfig = {
  dev: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    database: process.env.POSTGRES_NAME,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  // Add other environments like test, production, etc., as needed
};

module.exports = databaseConfig;