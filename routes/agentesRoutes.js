const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');
const { idSchema } = require('../utils/schemas');
const { ValidationError } = require('../utils/errorHandler');

// Middleware para validar parâmetros
const validateParams = (req, res, next) => {
  try {
    // Validar parâmetro ID se existir
    if (req.params.id) {
      const idParse = idSchema.safeParse({ id: req.params.id });
      if (!idParse.success) {
        const { fieldErrors } = idParse.error.flatten();
        throw new ValidationError(fieldErrors);
      }
    }
    // Se a validação passou, segue fluxo
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/', authMiddleware, agentesController.getAllAgentes);
router.get('/:id', authMiddleware, validateParams, agentesController.getAgenteById);
router.get('/:id/casos', authMiddleware, validateParams, agentesController.getCasosByAgente);
router.post('/', authMiddleware, agentesController.createAgente);
router.put('/:id', authMiddleware, validateParams, agentesController.updateAgente);
router.patch('/:id', authMiddleware, validateParams, agentesController.patchAgente);
router.delete('/:id', authMiddleware, validateParams, agentesController.deleteAgente);

module.exports = router; 