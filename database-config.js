const dbConfig = require('./dist/dbConfig/dbConfig');
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
