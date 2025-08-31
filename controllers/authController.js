const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');
const { validarSenha } = require('../utils/validators');

class AuthController {
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      const allowedFields = ['nome', 'email', 'senha'];
      const receivedFields = Object.keys(req.body);
      const extraFields = receivedFields.filter(field => !allowedFields.includes(field));
      
      if (extraFields.length > 0) {
        return res.status(400).json({
          error: `Campo(s) extra(s) não permitido(s): ${extraFields.join(', ')}`
        });
      }

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios'
        });
      }

      // Validar formato da senha
      if (!validarSenha(senha)) {
        return res.status(400).json({
          error: 'A senha deve ter no mínimo 8 caracteres, sendo pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial'
        });
      }

      // Verificar se o email já existe
      const usuarioExistente = await usuariosRepository.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Email já está em uso'
        });
      }

      // Hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Criar usuário
      const usuario = await usuariosRepository.create({
        nome,
        email,
        senha: senhaHash
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário por email
      const usuario = await usuariosRepository.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({
          error: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          nome: usuario.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(200).json({
        acess_token: token
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async logout(req, res) {
    try {
      // Em uma implementação real, você poderia invalidar o token
      // Por enquanto, apenas retornamos sucesso
      res.status(200).json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async listUsers(req, res) {
    try {
      const usuarios = await usuariosRepository.findAll();
      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = parseInt(id);

      if (isNaN(usuarioId)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const deletado = await usuariosRepository.delete(usuarioId);
      if (!deletado) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const usuario = await usuariosRepository.findById(req.user.id);
      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new AuthController();
