const bcrypt = require('bcrypt');

exports.seed = async function seed(knex) {
  const senhas = [
    'Admin123!',
    'User456@',
    'Test789#'
  ];

  const senhasHash = await Promise.all(
    senhas.map(senha => bcrypt.hash(senha, 10))
  );

  const usuarios = [
    {
      nome: 'Administrador do Sistema',
      email: 'admin@policia.gov.br',
      senha: senhasHash[0],
    },
    {
      nome: 'Usuário Padrão',
      email: 'user@policia.gov.br',
      senha: senhasHash[1],
    },
    {
      nome: 'Teste de Sistema',
      email: 'teste@policia.gov.br',
      senha: senhasHash[2],
    },
  ];

  for (const usuario of usuarios) {
    try {
      const existingUser = await knex('usuarios').where('email', usuario.email).first();
      
      if (!existingUser) {
        await knex('usuarios').insert(usuario);
        console.log(`✅ Usuário criado: ${usuario.email}`);
      } else {
        console.log(`⚠️  Usuário já existe: ${usuario.email}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${usuario.email}:`, error.message);
      throw error;
    }
  }
};
