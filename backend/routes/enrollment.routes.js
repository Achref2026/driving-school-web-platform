const express = require('express');
const router = express.Router();
const { Enrollment, Course, Instructor, User, DrivingSchool } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create a new enrollment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, instructorId, drivingSchoolId } = req.body;
    const userId = req.user.id;

    // Validate course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate driving school exists
    const drivingSchool = await DrivingSchool.findByPk(drivingSchoolId);
    if (!drivingSchool) {
      return res.status(404).json({ message: 'Driving school not found' });
    }

    // Validate instructor if provided (code courses don't need an instructor)
    if (instructorId && course.type !== 'code') {
      const instructor = await Instructor.findByPk(instructorId);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      // Check if instructor is from the same driving school
      if (instructor.drivingSchoolId !== drivingSchoolId) {
        return res.status(400).json({ message: 'Instructor does not belong to this driving school' });
      }

      // Get instructor's gender to verify compatibility
      const instructorUser = await User.findByPk(instructor.userId);
      const studentUser = await User.findByPk(userId);
      
      if (instructorUser.gender !== studentUser.gender) {
        // Check if driving school allows this gender combination
        if (instructorUser.gender === 'male' && !drivingSchool.hasMaleInstructors) {
          return res.status(400).json({ message: 'Male instructors are not available at this driving school' });
        }
        if (instructorUser.gender === 'female' && !drivingSchool.hasFemaleInstructors) {
          return res.status(400).json({ message: 'Female instructors are not available at this driving school' });
        }
      }
    }

    // Check if user has already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId,
        drivingSchoolId
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      instructorId: instructorId || null,
      drivingSchoolId,
      status: 'pending',
      paymentStatus: 'pending',
      paymentAmount: course.price
    });

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's enrollments
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          attributes: ['id', 'name', 'type', 'price', 'durationHours']
        },
        {
          model: Instructor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName', 'gender']
            }
          ]
        },
        {
          model: DrivingSchool,
          attributes: ['id', 'name', 'address', 'region', 'phoneNumber', 'email']
        }
      ]
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get enrollment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const enrollment = await Enrollment.findOne({
      where: { 
        id,
        userId // Ensure user can only see their own enrollments
      },
      include: [
        {
          model: Course,
          attributes: ['id', 'name', 'type', 'price', 'durationHours']
        },
        {
          model: Instructor,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName', 'gender']
            }
          ]
        },
        {
          model: DrivingSchool,
          attributes: ['id', 'name', 'address', 'region', 'phoneNumber', 'email']
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error getting enrollment details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;