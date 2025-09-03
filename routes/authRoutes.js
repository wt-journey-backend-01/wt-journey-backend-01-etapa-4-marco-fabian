const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas (não precisam de autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// Compat: endpoint em inglês esperado por alguns testes
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
