const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas (não precisam de autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas (precisam de autenticação)
router.get('/usuarios', authMiddleware, authController.listUsers);
router.delete('/usuarios/:id', authMiddleware, authController.deleteUser);
router.get('/usuarios/me', authMiddleware, authController.getProfile);

module.exports = router;
