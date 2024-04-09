const dbConfig = require('./dbConfig');
console.log(`NODE_ENV2: ${process.env.NODE_ENV}`);

module.exports = {
  dev: {
    driver: 'pg',
    ...dbConfig,
  },
  test: {
    driver: 'pg',
    ...dbConfig,
  },
};
