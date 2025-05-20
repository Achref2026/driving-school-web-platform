const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
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
    allowNull: true,
    comment: 'Only applicable for parking and road courses',
    references: {
      model: 'Instructors',
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
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATE
  },
  completionDate: {
    type: DataTypes.DATE
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  codeCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parkingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  roadCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Enrollment;