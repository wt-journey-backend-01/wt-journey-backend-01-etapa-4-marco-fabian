const knexConfig = require('../knexfile');
const knex = require('knex'); 

const nodeEnv = process.env.NODE_ENV || 'development';

let config;
if (process.env.AUTOGRADER_ENV || process.env.CI) {
  config = knexConfig.autograder || knexConfig.ci;
} else {
  config = knexConfig[nodeEnv];
}

if (config && config.connection) {
  config.connection.user = config.connection.user || 'postgres';
  config.connection.password = config.connection.password || 'postgres';
  config.connection.database = config.connection.database || 'policia_db';
}

const db = knex(config);

module.exports = db; 