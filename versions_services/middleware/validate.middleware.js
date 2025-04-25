const { body, validationResult } = require('express-validator');

const validateCreateVersion = [
  body('versionNumber')
    .matches(/^\d+\.\d+$/)
    .withMessage('Version number must be in the format X.Y (e.g., 1.0, 1.1)')
    .notEmpty()
    .withMessage('Version number is required'),
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array().map(err => err.msg) });
  }
  next();
};

module.exports = {
  validateCreateVersion: [...validateCreateVersion, checkValidation],
};