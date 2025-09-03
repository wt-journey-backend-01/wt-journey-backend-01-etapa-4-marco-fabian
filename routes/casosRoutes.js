const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, casosController.getAllCasos);
router.get('/:id', authMiddleware, casosController.getCasoById);
router.get('/:caso_id/agente', authMiddleware, casosController.getAgenteFromCaso);
router.post('/', authMiddleware, casosController.createCaso);
router.put('/:id', authMiddleware, casosController.updateCaso);
router.patch('/:id', authMiddleware, casosController.patchCaso);
router.delete('/:id', authMiddleware, casosController.deleteCaso);

module.exports = router; 