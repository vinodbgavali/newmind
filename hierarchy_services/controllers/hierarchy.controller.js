const Folder = require('../models/folder.model');
const Document = require('../models/document.model');
const axios = require('axios');
const { Op } = require('sequelize');

// Get root-level folders
exports.getRootFolders = async (req, res) => {
  try {
    const userId = req.user;
    const folders = await Folder.findAll({
      where: { user: userId, parentFolder: null },
    });
    
    res.json({ message: 'Root folders retrieved successfully', data: folders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get folder content
exports.getFolderContent = async (req, res) => {
  try {
    const userId = req.user;
    const { folderId } = req.params;

    const folder = await Folder.findOne({ where: { id: folderId, user: userId } });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    const subfolders = await Folder.findAll({
      where: { parentFolder: folderId, user: userId },
    });
    const documents = await Document.findAll({
      where: { folder: folderId, user: userId },
    });

    res.json({
      message: 'Folder content retrieved successfully',
      data: { folder, subfolders, documents },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a folder
exports.createFolder = async (req, res) => {
  try {
    const userId = req.user;
    const { folderName, parentFolder } = req.body;

    if (parentFolder) {
      const parent = await Folder.findOne({ where: { id: parentFolder, user: userId } });
      if (!parent) {
        return res.status(400).json({ message: 'Parent folder not found or unauthorized' });
      }
    }

    const folder = await Folder.create({
      folderName,
      parentFolder: parentFolder || null,
      user: userId,
    });

    res.status(201).json({ message: 'Folder created successfully', data: folder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a folder
exports.updateFolder = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { name } = req.body;

    const folder = await Folder.findOne({ where: { id, user: userId } });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    folder.name = name;
    await folder.save();

    res.json({ message: 'Folder updated successfully', data: folder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a folder
exports.deleteFolder = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const folder = await Folder.findOne({ where: { id, user: userId } });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    await deleteSubfoldersAndDocuments(id, userId, req.token);

    await Folder.destroy({ where: { id, user: userId } });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to delete subfolders and documents
async function deleteSubfoldersAndDocuments(folderId, userId, token) {
  const subfolders = await Folder.findAll({ where: { parentFolder: folderId, user: userId } });
  for (const subfolder of subfolders) {
    await deleteSubfoldersAndDocuments(subfolder.id, userId, token);
    await Folder.destroy({ where: { id: subfolder.id, user: userId } });
  }

  const documents = await Document.findAll({ where: { folder: folderId, user: userId } });
  for (const doc of documents) {
    await axios.delete(`${process.env.VERSIONS_SERVICE_URL}/api/documents/${doc.id}/versions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await Document.destroy({ where: { id: doc.id, user: userId } });
  }
}

// Get document details
exports.getDocument = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const document = await Document.findOne({ where: { id, user: userId } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    const versionsResponse = await axios.get(
      `${process.env.VERSIONS_SERVICE_URL}/api/documents/${id}/versions`,
      { headers: { Authorization: `Bearer ${req.token}` } }
    );

    res.json({
      message: 'Document retrieved successfully',
      data: {
        id: document.id,
        title: document.title,
        folder: document.folder,
        createdAt: document.createdAt,
        versions: versionsResponse.data.data,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

// Create a document
exports.createDocument = async (req, res) => {
  try {
    console.log('insde create document');
    
    const userId = req.user;
    const { title, content, folder } = req.body;
    const file = req.file;
    const token = req.cookies?.authToken;
    console.log('the token is ', token);
    
  
    const parentFolder = await Folder.findOne({ where: { id: folder, user: userId } });
    if (!parentFolder) {
      return res.status(400).json({ message: 'Folder not found or unauthorized' });
    }

    const document = await Document.create({
      title,
      content: content || '',
      folder,
      user: userId,
      file: file.filename
    });

   

    res.status(201).json({
      message: 'Document created successfully',
      data: { document},
    });
  } catch (error) {
    res.status(400).json({ message: error.response?.data?.message || error.message });
  }
};



// exports.createDocument = async (req, res) => {
//   try {
//     console.log('insde create document');
    
//     const userId = req.user;
//     const { title, content, folder } = req.body;
//     const file = req.file;
//     const token = req.cookies?.authToken;
//     console.log('the token is ', token);
    
  
//     const parentFolder = await Folder.findOne({ where: { id: folder, user: userId } });
//     if (!parentFolder) {
//       return res.status(400).json({ message: 'Folder not found or unauthorized' });
//     }

//     const document = await Document.create({
//       title,
//       content: content || '',
//       folder,
//       user: userId,
//       file: file.filename
//     });

//     let versionData = null;
//     if (file) {
//       const fileUrl = `https://storage.example.com/file_${document.id}_1.0.pdf`;
//       const versionResponse = await axios.post(
//         `${process.env.VERSIONS_SERVICE_URL}/api/documents/${document.id}/version`,
//         { versionNumber: '1.0', fileUrl },
//        { headers: {
//           Cookie: `authToken=${token}`
//         } }
//       );
//       versionData = versionResponse.data.data;
//     }

//     res.status(201).json({
//       message: 'Document created successfully',
//       data: { document, version: versionData },
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.response?.data?.message || error.message });
//   }
// };

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { title, content } = req.body;

    const document = await Document.findOne({ where: { id, user: userId } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    document.title = title;
    document.content = content || document.content;
    await document.save();

    res.json({ message: 'Document updated successfully', data: document });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const document = await Document.findOne({ where: { id, user: userId } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    await axios.delete(`${process.env.VERSIONS_SERVICE_URL}/api/documents/${id}/versions`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });

    await Document.destroy({ where: { id, user: userId } });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

// Filter documents
exports.filterDocuments = async (req, res) => {
  try {
    const userId = req.user;
    const { search } = req.query;

    const query = { user: userId };
    if (search) {
      query[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const documents = await Document.findAll({ where: query });
    const result = await Promise.all(
      documents.map(async (doc) => {
        const folderPath = await getFolderPath(doc.folder, userId);
        return {
          id: doc.id,
          title: doc.title,
          folderPath,
        };
      })
    );

    res.json({ message: 'Documents filtered successfully', data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get total document count
exports.getTotalDocuments = async (req, res) => {
  try {
    const userId = req.user;
    const totalDocuments = await Document.count({ where: { user: userId } });
    res.json({ message: 'Total documents retrieved successfully', data: { totalDocuments } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to build folder path
async function getFolderPath(folderId, userId) {
  let path = [];
  let currentFolder = await Folder.findOne({ where: { id: folderId, user: userId } });
  while (currentFolder) {
    path.unshift(currentFolder.name);
    currentFolder = await Folder.findOne({
      where: { id: currentFolder.parentFolder, user: userId },
    });
  }
  return path.join('/');
}