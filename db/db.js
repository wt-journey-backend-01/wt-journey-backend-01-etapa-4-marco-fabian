const knexConfig = require('../knexfile');
const knex = require('knex'); 

const nodeEnv = process.env.NODE_ENV || 'development';

let config;
if (process.env.AUTOGRADER_ENV || process.env.CI) {
  console.log('🔧 Usando configuração do autograder/CI');
  config = knexConfig.autograder || knexConfig.ci;
} else {
  console.log(`🔧 Usando configuração para ambiente: ${nodeEnv}`);
  config = knexConfig[nodeEnv];
}

if (!config) {
  throw new Error(`Configuração não encontrada para o ambiente: ${nodeEnv}`);
}

if (config && config.connection) {
  config.connection.user = config.connection.user || process.env.POSTGRES_USER || 'postgres';
  config.connection.password = config.connection.password || process.env.POSTGRES_PASSWORD || 'postgres';
  config.connection.database = config.connection.database || process.env.POSTGRES_DB || 'policia_db';
  config.connection.host = config.connection.host || process.env.POSTGRES_HOST || '127.0.0.1';
  config.connection.port = config.connection.port || process.env.POSTGRES_PORT || 5432;
  
  console.log(`🔗 Conectando ao banco: ${config.connection.host}:${config.connection.port}/${config.connection.database}`);
}

const db = knex(config);

db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Conexão com banco de dados estabelecida');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com banco de dados:', error.message);
  });

module.exports = db; 