const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DrivingSchool = sequelize.define('DrivingSchool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Algerian wilaya/state'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logoUrl: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  hasFemaleInstructors: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasMaleInstructors: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = DrivingSchool;