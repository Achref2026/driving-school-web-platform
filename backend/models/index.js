const User = require('./User');
const DrivingSchool = require('./DrivingSchool');
const Instructor = require('./Instructor');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Schedule = require('./Schedule');
const Exam = require('./Exam');

// User relationships
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

// DrivingSchool relationships
DrivingSchool.hasMany(Instructor, { foreignKey: 'drivingSchoolId' });
Instructor.belongsTo(DrivingSchool, { foreignKey: 'drivingSchoolId' });

DrivingSchool.hasMany(Course, { foreignKey: 'drivingSchoolId' });
Course.belongsTo(DrivingSchool, { foreignKey: 'drivingSchoolId' });

DrivingSchool.hasMany(Enrollment, { foreignKey: 'drivingSchoolId' });
Enrollment.belongsTo(DrivingSchool, { foreignKey: 'drivingSchoolId' });

// Instructor relationships
Instructor.belongsTo(User, { foreignKey: 'userId' });
Instructor.hasMany(Schedule, { foreignKey: 'instructorId' });
Schedule.belongsTo(Instructor, { foreignKey: 'instructorId' });
Instructor.hasMany(Exam, { foreignKey: 'instructorId' });

// Course relationships
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });
Course.hasMany(Exam, { foreignKey: 'courseId' });

// Enrollment relationships
Enrollment.hasMany(Schedule, { foreignKey: 'enrollmentId' });
Schedule.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });
Enrollment.hasMany(Exam, { foreignKey: 'enrollmentId' });

// Schedule relationships
Schedule.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = {
  User,
  DrivingSchool,
  Instructor,
  Course,
  Enrollment,
  Schedule,
  Exam
};