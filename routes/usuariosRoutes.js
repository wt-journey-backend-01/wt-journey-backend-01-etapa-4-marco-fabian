const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, authController.listUsers);
router.delete('/:id', authMiddleware, authController.deleteUser);
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;


