const Version = require('../models/version.model');
const axios = require('axios');

exports.createVersion = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { versionNumber, fileName } = req.body;

    console.log(req.body);
    

    const versions = await Version.findAll({
      where: { documentId: id, user: userId },
      order: [['updatedAt', 'DESC']],
    });

    if (versions.some((v) => v.version === versionNumber)) {
      return res.status(400).json({ message: 'Version already exists' });
    }

    const version = await Version.create({
      documentId: id,
      version: versionNumber,
      fileUrl: fileName ,
      user: userId,
    });

    res.status(201).json({
      message: 'Version created successfully',
      data: {
        id: version.documentId,
        version: version.version,
        fileUrl: version.fileUrl,
        uploadedAt: version.uploadedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

exports.getVersions = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    await axios.get(`${process.env.HIERARCHY_SERVICE_URL}/api/documents/${id}`, {
      headers: { Authorization: `Bearer ${req.token}` },
    });

    const versions = await Version.findAll({
      where: { documentId: id, user: userId },
      order: [['uploadedAt', 'ASC']],
    });

    res.json({
      message: 'Versions retrieved successfully',
      data: versions.map((v) => ({
        version: v.version,
        fileUrl: v.fileUrl,
        uploadedAt: v.uploadedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

exports.deleteVersions = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    await Version.destroy({ where: { documentId: id, user: userId } });
    res.json({ message: 'Versions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};