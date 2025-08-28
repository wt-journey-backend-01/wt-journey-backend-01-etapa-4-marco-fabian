const db = require('../db/db');

class UsuariosRepository {
  async create({ nome, email, senha }) {
    const [usuario] = await db('usuarios')
      .insert({ nome, email, senha })
      .returning(['id', 'nome', 'email', 'created_at', 'updated_at']);
    
    return usuario;
  }

  async findByEmail(email) {
    const usuario = await db('usuarios')
      .where({ email })
      .first();
    
    return usuario;
  }

  async findById(id) {
    const usuario = await db('usuarios')
      .where({ id })
      .first();
    
    return usuario;
  }

  async findAll() {
    const usuarios = await db('usuarios')
      .select(['id', 'nome', 'email', 'created_at', 'updated_at'])
      .orderBy('nome');
    
    return usuarios;
  }

  async update(id, dados) {
    const [usuario] = await db('usuarios')
      .where({ id })
      .update(dados)
      .returning(['id', 'nome', 'email', 'created_at', 'updated_at']);
    
    return usuario;
  }

  async delete(id) {
    const deletado = await db('usuarios')
      .where({ id })
      .del();
    
    return deletado > 0;
  }
}

module.exports = new UsuariosRepository();
