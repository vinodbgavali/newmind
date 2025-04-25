const { body, validationResult } = require('express-validator');

const validateCreateFolder = [
  body('folderName').trim().notEmpty().withMessage('Folder name is required'),
  body('parentFolder')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Parent folder ID must be a number'),
];

const validateUpdateFolder = [
  body('folderName').trim().notEmpty().withMessage('Folder name is required'),
];

const validateCreateDocument = [
  body('title').trim().notEmpty().withMessage('Document title is required'),
  body('content').optional().isString().withMessage('Content must be a string'),
  body('folder').isInt().withMessage('Folder ID must be a number').notEmpty().withMessage('Folder ID is required'),
];

const validateUpdateDocument = [
  body('title').trim().notEmpty().withMessage('Document title is required'),
  body('content').optional().isString().withMessage('Content must be a string'),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array().map(err => err.msg) });
  }
  next();
};

module.exports = {
  validateCreateFolder: [...validateCreateFolder, checkValidation],
  validateUpdateFolder: [...validateUpdateFolder, checkValidation],
  validateCreateDocument: [...validateCreateDocument, checkValidation],
  validateUpdateDocument: [...validateUpdateDocument, checkValidation],
};