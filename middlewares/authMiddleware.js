const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obter o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar se o header está no formato correto: "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Verificar e decodificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expirado'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Token inválido'
          });
        }

        return res.status(401).json({
          error: 'Token inválido'
        });
      }

      // Adicionar os dados do usuário ao request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = authMiddleware;
