const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseSession = sequelize.define('CourseSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Enrollments',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('code', 'parking', 'road'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  meetLink: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For online code classes'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  examPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  examScore: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  examNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = CourseSession;
