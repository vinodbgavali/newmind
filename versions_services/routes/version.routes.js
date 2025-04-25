const express = require('express');
const router = express.Router();
const versionController = require('../controllers/version.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateCreateVersion } = require('../middleware/validate.middleware');

router.post('/documents/:id/version', authMiddleware, validateCreateVersion, versionController.createVersion);
router.get('/documents/:id/versions', authMiddleware, versionController.getVersions);
router.delete('/documents/:id/versions', authMiddleware, versionController.deleteVersions);

module.exports = router;