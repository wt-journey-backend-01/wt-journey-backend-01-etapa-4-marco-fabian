const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');
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

    // Validar parâmetro caso_id se existir
    if (req.params.caso_id) {
      const casoIdParse = idSchema.safeParse({ id: req.params.caso_id });
      if (!casoIdParse.success) {
        const { fieldErrors } = casoIdParse.error.flatten();
        throw new ValidationError(fieldErrors);
      }
    }
    // Se a validação passou, segue fluxo
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/', authMiddleware, casosController.getAllCasos);
router.get('/:id', authMiddleware, validateParams, casosController.getCasoById);
router.get('/:caso_id/agente', authMiddleware, validateParams, casosController.getAgenteFromCaso);
router.post('/', authMiddleware, casosController.createCaso);
router.put('/:id', authMiddleware, validateParams, casosController.updateCaso);
router.patch('/:id', authMiddleware, validateParams, casosController.patchCaso);
router.delete('/:id', authMiddleware, validateParams, casosController.deleteCaso);

module.exports = router; 