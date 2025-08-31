const usuariosSeed = require('./usuarios');
const agentesSeed = require('./agentes');
const casosSeed = require('./casos');

exports.seed = async function seed(knex) {
  console.log('🌱 Executando seeds...');
  
  try {
    // Limpar todas as tabelas primeiro (ordem reversa devido às foreign keys)
    console.log('🧹 Limpando tabelas...');
    await knex('casos').del();
    await knex('agentes').del();
    await knex('usuarios').del();
    
    // Executar seeds na ordem correta
    console.log('📝 Criando usuários...');
    await usuariosSeed.seed(knex);
    
    console.log('👮 Criando agentes...');
    await agentesSeed.seed(knex);
    
    console.log('📋 Criando casos...');
    await casosSeed.seed(knex);
    
    console.log('✅ Todos os seeds foram executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error.message);
    throw error;
  }
};
