const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validate.middleware');


// Create a new user (public)
router.post('/register', validateRegister, userController.createUser);

// Login user (public)
router.post('/login',validateLogin, userController.loginUser);

// Logout user (protected)
router.post('/logout', authMiddleware, userController.logoutUser);

// Validate token (internal)
router.get('/validate-token', userController.validateToken);

module.exports = router;