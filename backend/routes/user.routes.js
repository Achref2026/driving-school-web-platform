const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);

module.exports = router;
