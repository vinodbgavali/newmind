const express = require('express');
const router = express.Router();
const multer = require('multer');
const hierarchyController = require('../controllers/hierarchy.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateCreateFolder, validateUpdateFolder, validateCreateDocument, validateUpdateDocument,} = require('../middleware/validate.middleware');

const upload = require('../middleware/upload_file');

router.get('/viewstore', authMiddleware, hierarchyController.getRootFolders);
router.get('/viewstore/:folderId', authMiddleware, hierarchyController.getFolderContent);
router.post('/folders', authMiddleware, validateCreateFolder, hierarchyController.createFolder);
router.put('/folders/:id', authMiddleware, validateUpdateFolder, hierarchyController.updateFolder);
router.delete('/folders/:id', authMiddleware, hierarchyController.deleteFolder);

router.get('/documents/:id', authMiddleware, hierarchyController.getDocument);
router.post('/documents', authMiddleware, upload.single('file'), validateCreateDocument, hierarchyController.createDocument );
router.put('/documents/:id', authMiddleware, validateUpdateDocument, hierarchyController.updateDocument);
router.delete('/documents/:id', authMiddleware, hierarchyController.deleteDocument);

router.get('/filter', authMiddleware, hierarchyController.filterDocuments);
router.get('/total-documents', authMiddleware, hierarchyController.getTotalDocuments);

module.exports = router;