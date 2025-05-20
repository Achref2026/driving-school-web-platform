const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const courseController = require('../controllers/course.controller');

// Protected routes
router.post('/', auth, checkRole('instructor', 'manager', 'admin'), courseController.createCourse);
router.get('/enrollment/:enrollmentId', auth, courseController.getEnrollmentCourses);
router.put('/:id', auth, checkRole('instructor', 'manager', 'admin'), courseController.updateCourse);
router.post('/:courseId/exam', auth, checkRole('instructor', 'manager', 'admin'), courseController.addExamResult);

module.exports = router;
