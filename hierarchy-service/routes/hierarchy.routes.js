const express = require('express');
const router = express.Router();
const hierarchyController = require('../controllers/hierarchy.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Folder endpoints
router.get('/viewstore', authMiddleware, hierarchyController.getRootFolders);
router.get('/viewstore/:folderId', authMiddleware, hierarchyController.getFolderContent);
router.post('/folders', authMiddleware, hierarchyController.createFolder);
router.put('/folders/:id', authMiddleware, hierarchyController.updateFolder);
router.delete('/folders/:id', authMiddleware, hierarchyController.deleteFolder);

// Document endpoints
router.get('/documents/:id', authMiddleware, hierarchyController.getDocument);
router.post('/documents', authMiddleware, hierarchyController.createDocument);
router.put('/documents/:id', authMiddleware, hierarchyController.updateDocument);
router.delete('/documents/:id', authMiddleware, hierarchyController.deleteDocument);

// Filter and count endpoints
router.get('/filter', authMiddleware, hierarchyController.filterDocuments);
router.get('/total-documents', authMiddleware, hierarchyController.getTotalDocuments);

module.exports = router;