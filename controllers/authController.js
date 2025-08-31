const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');
const { 
  EmailExistsError, 
  UserNotFoundError, 
  InvalidPasswordError,
  ValidationError 
} = require('../utils/errorHandler');
const { 
  usuarioRegSchema, 
  usuarioLoginSchema, 
  idSchema 
} = require('../utils/schemas');

class AuthController {
  async register(req, res, next) {
    try {
      // Validar dados com Zod
      const bodyParse = usuarioRegSchema.safeParse(req.body);
      if (!bodyParse.success) {
        const { formErrors, fieldErrors } = bodyParse.error.flatten();
        throw new ValidationError({
          ...(formErrors.length ? { bodyFormat: formErrors } : {}),
          ...fieldErrors
        });
      }

      const { nome, email, senha } = bodyParse.data;

      // Verificar se o email já existe
      const usuarioExistente = await usuariosRepository.findByEmail(email);
      if (usuarioExistente) {
        throw new EmailExistsError({
          email: `O email '${email}' já está em uso.`
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
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Validar dados com Zod
      const bodyParse = usuarioLoginSchema.safeParse(req.body);
      if (!bodyParse.success) {
        const { formErrors, fieldErrors } = bodyParse.error.flatten();
        throw new ValidationError({
          ...(formErrors.length ? { bodyFormat: formErrors } : {}),
          ...fieldErrors
        });
      }

      const { email, senha } = bodyParse.data;

      // Buscar usuário por email
      const usuario = await usuariosRepository.findByEmail(email);
      if (!usuario) {
        throw new UserNotFoundError({
          user: `O usuário com o email '${email}' não foi encontrado.`
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        throw new InvalidPasswordError({
          senha: 'A senha é inválida.'
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
        access_token: token
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Em uma implementação real, você poderia invalidar o token
      // Por enquanto, apenas retornamos sucesso
      res.status(200).json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req, res, next) {
    try {
      const usuarios = await usuariosRepository.findAll();
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      // Validar ID com Zod
      const idParse = idSchema.safeParse(req.params);
      if (!idParse.success) {
        const { fieldErrors } = idParse.error.flatten();
        throw new ValidationError(fieldErrors);
      }

      const { id } = idParse.data;

      const deletado = await usuariosRepository.delete(id);
      if (!deletado) {
        throw new UserNotFoundError({
          id: `O ID '${id}' não existe nos usuários`
        });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const usuario = await usuariosRepository.findById(req.user.id);
      if (!usuario) {
        throw new UserNotFoundError({
          user: 'Usuário não encontrado'
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
      next(error);
    }
  }
}

module.exports = new AuthController();
