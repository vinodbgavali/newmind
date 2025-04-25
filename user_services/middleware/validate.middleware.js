const { body, validationResult } = require('express-validator');

// Validation for register
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

// Validation for login
const validateLogin = [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Middleware to handle validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array().map(err => err.msg) });
  }
  next();
};

module.exports = {
  validateRegister: [...validateRegister, checkValidation],
  validateLogin: [...validateLogin, checkValidation],
};