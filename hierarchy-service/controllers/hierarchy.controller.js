const Folder = require('../models/folder.model');
const Document = require('../models/document.model');
const axios = require('axios');

// Get root-level folders
exports.getRootFolders = async (req, res) => {
  try {
    const userId = req.user;
    const folders = await Folder.find({ user: userId, parentFolder: null });
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

    const folder = await Folder.findOne({ _id: folderId, user: userId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    const subfolders = await Folder.find({ parentFolder: folderId, user: userId });
    const documents = await Document.find({ folder: folderId, user: userId });

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
    const { name, parentFolder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    if (parentFolder) {
      const parent = await Folder.findOne({ _id: parentFolder, user: userId });
      if (!parent) {
        return res.status(400).json({ message: 'Parent folder not found or unauthorized' });
      }
    }

    const folder = new Folder({
      name,
      parentFolder: parentFolder || null,
      user: userId,
    });

    await folder.save();
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

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const folder = await Folder.findOne({ _id: id, user: userId });
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

    const folder = await Folder.findOne({ _id: id, user: userId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    // Delete subfolders and documents
    await deleteSubfoldersAndDocuments(id, userId);

    // Delete the folder
    await Folder.deleteOne({ _id: id, user: userId });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to delete subfolders and documents
async function deleteSubfoldersAndDocuments(folderId, userId) {
  const subfolders = await Folder.find({ parentFolder: folderId, user: userId });
  for (const subfolder of subfolders) {
    await deleteSubfoldersAndDocuments(subfolder._id, userId);
    await Folder.deleteOne({ _id: subfolder._id, user: userId });
  }
  await Document.deleteMany({ folder: folderId, user: userId });
}

// Get document details
exports.getDocument = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    const document = await Document.findOne({ _id: id, user: userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    // Fetch versions from Versions Service
    const versionsResponse = await axios.get(
      `http://localhost:3003/api/documents/${id}/versions`,
      {
        headers: { Authorization: req.header('Authorization') },
      }
    );

    res.json({
      message: 'Document retrieved successfully',
      data: {
        id: document._id,
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
    const userId = req.user;
    const { title, content, folder } = req.body;

    if (!title || !folder) {
      return res.status(400).json({ message: 'Title and folder are required' });
    }

    const parentFolder = await Folder.findOne({ _id: folder, user: userId });
    if (!parentFolder) {
      return res.status(400).json({ message: 'Folder not found or unauthorized' });
    }

    const document = new Document({
      title,
      content: content || '',
      folder,
      user: userId,
    });

    await document.save();
    res.status(201).json({ message: 'Document created successfully', data: document });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a document
exports.updateDocument = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const document = await Document.findOne({ _id: id, user: userId });
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

    const document = await Document.findOne({ _id: id, user: userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    // Delete document
    await Document.deleteOne({ _id: id, user: userId });

    // Delete versions via Versions Service
    await axios.delete(`http://localhost:3003/api/documents/${id}/versions`, {
      headers: { Authorization: req.header('Authorization') },
    });

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
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(query);
    const result = await Promise.all(
      documents.map(async (doc) => {
        const folderPath = await getFolderPath(doc.folder, userId);
        return {
          id: doc._id,
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
    const totalDocuments = await Document.countDocuments({ user: userId });
    res.json({ message: 'Total documents retrieved successfully', data: { totalDocuments } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to build folder path
async function getFolderPath(folderId, userId) {
  let path = [];
  let currentFolder = await Folder.findOne({ _id: folderId, user: userId });
  while (currentFolder) {
    path.unshift(currentFolder.name);
    currentFolder = await Folder.findOne({ _id: currentFolder.parentFolder, user: userId });
  }
  return path.join('/');
}