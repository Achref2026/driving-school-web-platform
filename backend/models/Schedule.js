const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  courseType: {
    type: DataTypes.ENUM('code', 'parking', 'road'),
    allowNull: false
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'If slot is booked, will contain the enrollment ID'
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'For code courses, this can be up to 20'
  },
  currentStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
});

module.exports = Schedule;