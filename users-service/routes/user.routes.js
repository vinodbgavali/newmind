const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Create a new user (public)
router.post('/register', userController.createUser);

// Login user (public)
router.post('/login', userController.loginUser);

// Logout user (protected)
router.post('/logout', authMiddleware, userController.logoutUser);

// Get all users (protected)
router.get('/', authMiddleware, userController.getAllUsers);

// Validate token (internal)
router.get('/validate-token', userController.validateToken);

module.exports = router;