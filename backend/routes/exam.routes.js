const express = require('express');
const router = express.Router();
const { Exam, User, Course, Enrollment, DrivingSchool } = require('../models');
const { authenticateToken, isInstructor, isManager } = require('../middleware/auth');

// Get all exams for a driving school
router.get('/school/:schoolId', authenticateToken, isManager, async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const exams = await Exam.findAll({
      include: [
        {
          model: Course,
          where: { drivingSchoolId: schoolId },
          attributes: ['id', 'name', 'type']
        },
        {
          model: Enrollment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'gender']
            }
          ]
        }
      ]
    });
    
    res.json(exams);
  } catch (error) {
    console.error('Error getting school exams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get exams for a student
router.get('/student', authenticateToken, async (req, res) => {
  try {
    // Find all enrollments for the student
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id }
    });
    
    const enrollmentIds = enrollments.map(enrollment => enrollment.id);
    
    const exams = await Exam.findAll({
      where: { enrollmentId: enrollmentIds },
      include: [
        {
          model: Course,
          attributes: ['id', 'name', 'type']
        }
      ],
      order: [['date', 'ASC']]
    });
    
    res.json(exams);
  } catch (error) {
    console.error('Error getting student exams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule a new exam (instructor/manager only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, enrollmentId, courseId, instructorId } = req.body;
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [
        {
          model: Course
        }
      ]
    });
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Validate the user is either an instructor or a manager
    if (req.user.role !== 'instructor' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'You are not authorized to schedule exams' });
    }
    
    // Create the exam
    const exam = await Exam.create({
      date,
      enrollmentId,
      courseId,
      instructorId,
      status: 'scheduled'
    });
    
    res.status(201).json(exam);
  } catch (error) {
    console.error('Error scheduling exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update exam result (instructor only)
router.put('/:id', authenticateToken, isInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { score, passed, feedback } = req.body;
    
    const exam = await Exam.findByPk(id);
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    // Update exam
    await exam.update({
      score,
      passed,
      feedback,
      status: 'completed'
    });
    
    // If the exam is passed, update the enrollment progress
    if (passed) {
      const enrollment = await Enrollment.findByPk(exam.enrollmentId);
      const course = await Course.findByPk(exam.courseId);
      
      if (enrollment && course) {
        // Update progress based on course type
        if (course.type === 'code') {
          await enrollment.update({ codeCompleted: true });
        } else if (course.type === 'parking') {
          await enrollment.update({ parkingCompleted: true });
        } else if (course.type === 'road') {
          await enrollment.update({ roadCompleted: true });
        }
        
        // Check if all courses are completed
        if (enrollment.codeCompleted && enrollment.parkingCompleted && enrollment.roadCompleted) {
          await enrollment.update({ status: 'completed' });
        }
      }
    }
    
    res.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reschedule an exam (instructor/manager only)
router.put('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    
    const exam = await Exam.findByPk(id);
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    // Validate the user is either an instructor or a manager
    if (req.user.role !== 'instructor' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'You are not authorized to reschedule exams' });
    }
    
    // Update exam
    await exam.update({
      date,
      status: 'rescheduled'
    });
    
    res.json(exam);
  } catch (error) {
    console.error('Error rescheduling exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an exam (manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findByPk(id);
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    await exam.destroy();
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;