const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user.routes');
const drivingSchoolRoutes = require('./drivingSchool.routes');
const courseRoutes = require('./course.routes');
const instructorRoutes = require('./instructor.routes');
const scheduleRoutes = require('./schedule.routes');
const examRoutes = require('./exam.routes');
const enrollmentRoutes = require('./enrollment.routes');

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Driving School Management API' });
});

// Use route modules
router.use('/users', userRoutes);
router.use('/driving-schools', drivingSchoolRoutes);
router.use('/courses', courseRoutes);
router.use('/instructors', instructorRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/exams', examRoutes);
router.use('/enrollments', enrollmentRoutes);

module.exports = router;