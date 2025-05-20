const { Course, Enrollment, User } = require('../models');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { enrollmentId, type, title, date, duration, meetLink } = req.body;
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [{
        model: User,
        as: 'instructor'
      }]
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify that the user is the instructor or manager
    if (enrollment.instructorId !== req.user.id && req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create courses for this enrollment' });
    }
    
    // Ensure enrollment is active
    if (enrollment.status !== 'active') {
      return res.status(400).json({ message: 'Cannot create courses for inactive enrollments' });
    }
    
    // Validate course type
    if (!['code', 'parking', 'road'].includes(type)) {
      return res.status(400).json({ message: 'Invalid course type. Must be code, parking, or road' });
    }
    
    // Check if student is eligible for this course type
    if (type === 'parking' && !enrollment.codeCompleted) {
      return res.status(400).json({ message: 'Student must complete code course before starting parking course' });
    }
    
    if (type === 'road' && (!enrollment.codeCompleted || !enrollment.parkingCompleted)) {
      return res.status(400).json({ message: 'Student must complete code and parking courses before starting road course' });
    }
    
    // Create course
    const course = await Course.create({
      enrollmentId,
      type,
      title,
      date,
      duration,
      meetLink,
      completed: false
    });
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course', error: error.message });
  }
};

// Get all courses for an enrollment
exports.getEnrollmentCourses = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify that the user is authorized
    if (enrollment.studentId !== req.user.id && 
        enrollment.instructorId !== req.user.id && 
        req.user.role !== 'manager' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these courses' });
    }
    
    // Get courses
    const courses = await Course.findAll({
      where: { enrollmentId },
      order: [['date', 'ASC']]
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching enrollment courses:', error);
    res.status(500).json({ message: 'Server error fetching courses', error: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the course
    const course = await Course.findByPk(id, {
      include: [{
        model: Enrollment,
        as: 'enrollment'
      }]
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify that the user is authorized
    if (course.enrollment.instructorId !== req.user.id && 
        req.user.role !== 'manager' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Update the course
    await course.update(updates);
    
    // If course is marked as completed, update the enrollment progress
    if (updates.completed === true) {
      const enrollment = course.enrollment;
      
      // Update enrollment progress based on course type
      if (course.type === 'code') {
        await enrollment.update({ codeCompleted: true });
        if (!enrollment.parkingCompleted) {
          await enrollment.update({ currentCourse: 'parking' });
        }
      } else if (course.type === 'parking') {
        await enrollment.update({ parkingCompleted: true });
        if (!enrollment.roadCompleted) {
          await enrollment.update({ currentCourse: 'road' });
        }
      } else if (course.type === 'road') {
        await enrollment.update({ roadCompleted: true });
        // If all courses are completed, student has passed
        if (enrollment.codeCompleted && enrollment.parkingCompleted) {
          await enrollment.update({ status: 'completed' });
        }
      }
    }
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course', error: error.message });
  }
};

// Mark course as completed and/or add exam result
exports.addExamResult = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { passed, score, notes } = req.body;
    
    // Find the course
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Enrollment,
        as: 'enrollment'
      }]
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Verify that the user is authorized
    if (course.enrollment.instructorId !== req.user.id && 
        req.user.role !== 'manager' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add exam results' });
    }
    
    // Update the course with exam results
    await course.update({
      completed: true,
      examPassed: passed,
      examScore: score,
      examNotes: notes
    });
    
    // If exam is passed, update the enrollment progress
    if (passed) {
      const enrollment = course.enrollment;
      
      // Update enrollment progress based on course type
      if (course.type === 'code') {
        await enrollment.update({ codeCompleted: true });
        if (!enrollment.parkingCompleted) {
          await enrollment.update({ currentCourse: 'parking' });
        }
      } else if (course.type === 'parking') {
        await enrollment.update({ parkingCompleted: true });
        if (!enrollment.roadCompleted) {
          await enrollment.update({ currentCourse: 'road' });
        }
      } else if (course.type === 'road') {
        await enrollment.update({ roadCompleted: true });
        // If all courses are completed, student has passed
        if (enrollment.codeCompleted && enrollment.parkingCompleted) {
          await enrollment.update({ status: 'completed' });
        }
      }
    }
    
    res.json({
      message: 'Exam result added successfully',
      course
    });
  } catch (error) {
    console.error('Error adding exam result:', error);
    res.status(500).json({ message: 'Server error adding exam result', error: error.message });
  }
};
