const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconfig');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file: {
    type: DataTypes.TEXT,  // Adjust based on what you're storing (e.g., filename or URL)
    allowNull: false,
  },
  folder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Folders',
      key: 'id',
    },
  },
  user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Document;
