const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconfig');

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  folderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentFolder: {
    type: DataTypes.INTEGER,
    allowNull: true,
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

module.exports = Folder;