const jwt = require('jsonwebtoken');
const { TokenError } = require('../utils/errorHandler');

const authMiddleware = (req, res, next) => {
  try {
    // Obter o token do header Authorization ou cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.access_token;
    
    let token;
    
    if (authHeader) {
      // Verificar se o header está no formato correto: "Bearer <token>"
      const parts = authHeader.split(' ');
      
      if (parts.length !== 2) {
        throw new TokenError({
          authorization: 'Formato de token inválido. Use: Bearer <token>'
        });
      }

      const [scheme, headerToken] = parts;

      if (!/^Bearer$/i.test(scheme)) {
        throw new TokenError({
          authorization: 'Formato de token inválido. Use: Bearer <token>'
        });
      }

      token = headerToken;
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      throw new TokenError({
        access_token: 'Token de acesso não fornecido'
      });
    }

    // Verificar e decodificar o token (versão síncrona)
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new TokenError({
          token: 'Token expirado'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        throw new TokenError({
          token: 'Token inválido'
        });
      }

      throw new TokenError({
        token: 'Token inválido'
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return next(error);
  }
};

module.exports = authMiddleware;
