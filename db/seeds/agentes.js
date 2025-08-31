exports.seed = async function seed(knex) {
  // Agentes já foram limpos pelo seed principal

  await knex('agentes').insert([
    {
      nome: 'João Silva',
      dataDeIncorporacao: '2015-03-10',
      cargo: 'inspetor',
    },
    {
      nome: 'Maria Oliveira',
      dataDeIncorporacao: '2018-07-22',
      cargo: 'delegado',
    },
  ]);
};


