const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Enrollment = require('./Enrollment');
const Course = require('./Course');
const Instructor = require('./Instructor');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'rescheduled', 'cancelled'),
    defaultValue: 'scheduled'
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Enrollments',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Instructors',
      key: 'id'
    }
  }
});

// Set up associations
Exam.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });
Exam.belongsTo(Course, { foreignKey: 'courseId' });
Exam.belongsTo(Instructor, { foreignKey: 'instructorId' });

module.exports = Exam;