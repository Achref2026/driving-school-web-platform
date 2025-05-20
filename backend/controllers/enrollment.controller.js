const { Enrollment, DrivingSchool, User, Payment, Course } = require('../models');

// Create a new enrollment
exports.createEnrollment = async (req, res) => {
  try {
    const { drivingSchoolId, instructorId } = req.body;
    
    // Check if driving school exists
    const drivingSchool = await DrivingSchool.findByPk(drivingSchoolId);
    if (!drivingSchool) {
      return res.status(404).json({ message: 'Driving school not found' });
    }
    
    // Check if instructor exists
    if (instructorId) {
      const instructor = await User.findOne({
        where: { id: instructorId, role: 'instructor' }
      });
      
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      drivingSchoolId,
      instructorId,
      status: 'pending', // Initial status is pending until payment
      dateEnrolled: new Date(),
      currentCourse: 'code', // Start with code course
      codeCompleted: false,
      parkingCompleted: false,
      roadCompleted: false
    });
    
    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ message: 'Server error creating enrollment', error: error.message });
  }
};

// Get all enrollments for a student
exports.getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: DrivingSchool,
          as: 'drivingSchool'
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'gender']
        },
        {
          model: Course,
          as: 'courses'
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({ message: 'Server error fetching enrollments', error: error.message });
  }
};

// Get all enrollments for a driving school
exports.getDrivingSchoolEnrollments = async (req, res) => {
  try {
    const { drivingSchoolId } = req.params;
    
    // Check if user is manager of this driving school
    const drivingSchool = await DrivingSchool.findByPk(drivingSchoolId);
    if (!drivingSchool || (drivingSchool.managerId !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to view these enrollments' });
    }
    
    const enrollments = await Enrollment.findAll({
      where: { drivingSchoolId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'gender']
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'gender']
        },
        {
          model: Course,
          as: 'courses'
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching driving school enrollments:', error);
    res.status(500).json({ message: 'Server error fetching enrollments', error: error.message });
  }
};

// Update enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentCourse, codeCompleted, parkingCompleted, roadCompleted } = req.body;
    
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: DrivingSchool,
          as: 'drivingSchool'
        }
      ]
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Check authorization
    const drivingSchool = enrollment.drivingSchool;
    if (req.user.role !== 'admin' && drivingSchool.managerId !== req.user.id && enrollment.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this enrollment' });
    }
    
    // Update enrollment
    const updates = {};
    if (status) updates.status = status;
    if (currentCourse) updates.currentCourse = currentCourse;
    if (codeCompleted !== undefined) updates.codeCompleted = codeCompleted;
    if (parkingCompleted !== undefined) updates.parkingCompleted = parkingCompleted;
    if (roadCompleted !== undefined) updates.roadCompleted = roadCompleted;
    
    await enrollment.update(updates);
    
    res.json({
      message: 'Enrollment updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ message: 'Server error updating enrollment', error: error.message });
  }
};
