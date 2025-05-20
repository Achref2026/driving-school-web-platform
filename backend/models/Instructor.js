const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Instructor = sequelize.define('Instructor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  drivingSchoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DrivingSchools',
      key: 'id'
    }
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  licensedSince: {
    type: DataTypes.DATE
  },
  carModel: {
    type: DataTypes.STRING
  },
  carImageUrl: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  specialization: {
    type: DataTypes.ENUM('code', 'parking', 'road', 'all'),
    defaultValue: 'all'
  }
});

module.exports = Instructor;