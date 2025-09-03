const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, agentesController.getAllAgentes);
router.get('/:id', authMiddleware, agentesController.getAgenteById);
router.get('/:id/casos', authMiddleware, agentesController.getCasosByAgente);
router.post('/', authMiddleware, agentesController.createAgente);
router.put('/:id', authMiddleware, agentesController.updateAgente);
router.patch('/:id', authMiddleware, agentesController.patchAgente);
router.delete('/:id', authMiddleware, agentesController.deleteAgente);

module.exports = router; 