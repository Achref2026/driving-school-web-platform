const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const enrollmentController = require('../controllers/enrollment.controller');

// Protected routes
router.post('/', auth, enrollmentController.createEnrollment);
router.get('/student', auth, enrollmentController.getStudentEnrollments);
router.get('/driving-school/:drivingSchoolId', auth, checkRole('manager', 'admin', 'instructor'), enrollmentController.getDrivingSchoolEnrollments);
router.put('/:id', auth, enrollmentController.updateEnrollmentStatus);

module.exports = router;
