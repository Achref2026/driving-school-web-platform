const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('code', 'parking', 'road'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  drivingSchoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DrivingSchools',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in hours'
  },
  content: {
    type: DataTypes.TEXT,
    comment: 'For code course, this can contain the theory content or video URLs'
  }
});

module.exports = Course;