const bcrypt = require('bcrypt');

exports.seed = async function seed(knex) {
  // Usuários já foram limpos pelo seed principal

  // Senhas que atendem aos requisitos de segurança
  const senhas = [
    'Admin123!',    // Mínimo 8 chars, maiúscula, minúscula, número, especial
    'User456@',     // Mínimo 8 chars, maiúscula, minúscula, número, especial
    'Test789#'      // Mínimo 8 chars, maiúscula, minúscula, número, especial
  ];

  // Hash das senhas
  const senhasHash = await Promise.all(
    senhas.map(senha => bcrypt.hash(senha, 10))
  );

  // Inserir usuários com senhas hasheadas
  await knex('usuarios').insert([
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
  ]);
};
