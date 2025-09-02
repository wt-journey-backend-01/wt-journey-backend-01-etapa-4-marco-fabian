const usuariosSeed = require('./usuarios');
const agentesSeed = require('./agentes');
const casosSeed = require('./casos');

exports.seed = async function seed(knex) {
  console.log('🌱 Executando seeds...');
  
  try {
    await knex.raw('SELECT 1');
    console.log('✅ Conexão com banco de dados confirmada');
    
    console.log('🧹 Limpando tabelas...');
    await knex('casos').del();
    await knex('agentes').del();
    await knex('usuarios').del();
    
    try {
      await knex.raw('ALTER SEQUENCE usuarios_id_seq RESTART WITH 1');
      await knex.raw('ALTER SEQUENCE agentes_id_seq RESTART WITH 1');
      await knex.raw('ALTER SEQUENCE casos_id_seq RESTART WITH 1');
    } catch (seqError) {
      console.log('⚠️  Aviso: Não foi possível resetar sequências (normal em alguns ambientes)');
    }
    
    console.log('📝 Criando usuários...');
    await usuariosSeed.seed(knex);
    
    console.log('👮 Criando agentes...');
    await agentesSeed.seed(knex);
    
    console.log('📋 Criando casos...');
    await casosSeed.seed(knex);
    
    console.log('✅ Todos os seeds foram executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};
