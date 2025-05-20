const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const drivingSchoolRoutes = require('./drivingSchool.routes');
const enrollmentRoutes = require('./enrollment.routes');
const courseRoutes = require('./course.routes');
const paymentRoutes = require('./payment.routes');

router.use('/api/auth', userRoutes);
router.use('/api/driving-schools', drivingSchoolRoutes);
router.use('/api/enrollments', enrollmentRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api/payments', paymentRoutes);

module.exports = router;
