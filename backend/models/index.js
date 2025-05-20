const User = require('./User');
const DrivingSchool = require('./DrivingSchool');
const Instructor = require('./Instructor');
const Course = require('./Course');
const CourseSession = require('./CourseSession');
const Enrollment = require('./Enrollment');
const Schedule = require('./Schedule');
const Exam = require('./Exam');
const Payment = require('./Payment');

// User relationships
User.hasMany(Enrollment, { 
  foreignKey: 'studentId',
  as: 'enrollments'
});
Enrollment.belongsTo(User, { 
  foreignKey: 'studentId',
  as: 'student'
});

// DrivingSchool relationships
User.hasMany(DrivingSchool, {
  foreignKey: 'managerId',
  as: 'managedSchools'
});
DrivingSchool.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager'
});

DrivingSchool.hasMany(Instructor, { 
  foreignKey: 'drivingSchoolId',
  as: 'instructors'
});
Instructor.belongsTo(DrivingSchool, { 
  foreignKey: 'drivingSchoolId',
  as: 'drivingSchool'
});

DrivingSchool.hasMany(Course, { 
  foreignKey: 'drivingSchoolId',
  as: 'courses'
});
Course.belongsTo(DrivingSchool, { 
  foreignKey: 'drivingSchoolId',
  as: 'drivingSchool'
});

DrivingSchool.hasMany(Enrollment, { 
  foreignKey: 'drivingSchoolId',
  as: 'enrollments'
});
Enrollment.belongsTo(DrivingSchool, { 
  foreignKey: 'drivingSchoolId',
  as: 'drivingSchool'
});

// Instructor relationships
Instructor.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

User.hasOne(Instructor, {
  foreignKey: 'userId',
  as: 'instructorProfile'
});

Instructor.hasMany(Schedule, { 
  foreignKey: 'instructorId',
  as: 'schedules'
});
Schedule.belongsTo(Instructor, { 
  foreignKey: 'instructorId',
  as: 'instructor'
});

Instructor.hasMany(Exam, { 
  foreignKey: 'instructorId',
  as: 'exams'
});
Exam.belongsTo(Instructor, { 
  foreignKey: 'instructorId',
  as: 'instructor'
});

// Enrollment relationships
User.hasMany(Enrollment, {
  foreignKey: 'instructorId',
  as: 'instructorEnrollments'
});
Enrollment.belongsTo(User, {
  foreignKey: 'instructorId',
  as: 'instructor'
});

Enrollment.hasMany(CourseSession, { 
  foreignKey: 'enrollmentId',
  as: 'sessions'
});
CourseSession.belongsTo(Enrollment, { 
  foreignKey: 'enrollmentId',
  as: 'enrollment'
});

Enrollment.hasMany(Payment, { 
  foreignKey: 'enrollmentId',
  as: 'payments'
});
Payment.belongsTo(Enrollment, { 
  foreignKey: 'enrollmentId',
  as: 'enrollment'
});

Enrollment.hasMany(Exam, { 
  foreignKey: 'enrollmentId',
  as: 'exams'
});
Exam.belongsTo(Enrollment, { 
  foreignKey: 'enrollmentId',
  as: 'enrollment'
});

module.exports = {
  User,
  DrivingSchool,
  Instructor,
  Course,
  CourseSession,
  Enrollment,
  Schedule,
  Exam,
  Payment
};
