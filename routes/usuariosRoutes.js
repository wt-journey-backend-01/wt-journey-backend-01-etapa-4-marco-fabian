const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.listUsers);
router.delete('/:id', authController.deleteUser);
router.get('/me', authController.getProfile);

module.exports = router;


