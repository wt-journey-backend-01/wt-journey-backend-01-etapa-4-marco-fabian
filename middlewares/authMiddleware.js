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

    // Verificar e decodificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new TokenError({
            token: 'Token expirado'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          throw new TokenError({
            token: 'Token inválido'
          });
        }

        throw new TokenError({
          token: 'Token inválido'
        });
      }

      // Adicionar os dados do usuário ao request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return next(error);
  }
};

module.exports = authMiddleware;
