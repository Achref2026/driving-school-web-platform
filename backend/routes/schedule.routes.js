const express = require('express');
const router = express.Router();
const { Schedule, Instructor, User, Course, Enrollment } = require('../models');
const { authenticateToken, isInstructor, isManager } = require('../middleware/auth');

// Get all schedules for an instructor
router.get('/instructor', authenticateToken, isInstructor, async (req, res) => {
  try {
    // Get the instructor associated with the logged-in user
    const instructor = await Instructor.findOne({
      where: { userId: req.user.id }
    });
    
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    const schedules = await Schedule.findAll({
      where: { instructorId: instructor.id },
      include: [
        {
          model: Course,
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
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting instructor schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get schedules by driving school
router.get('/school/:schoolId', authenticateToken, isManager, async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Find instructors at this school
    const instructors = await Instructor.findAll({
      where: { drivingSchoolId: schoolId }
    });
    
    const instructorIds = instructors.map(instructor => instructor.id);
    
    const schedules = await Schedule.findAll({
      where: { instructorId: instructorIds },
      include: [
        {
          model: Instructor,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'gender']
            }
          ]
        },
        {
          model: Course,
          attributes: ['id', 'name', 'type']
        },
        {
          model: Enrollment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'gender']
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting school schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get schedules for a student (for their enrollments)
router.get('/student', authenticateToken, async (req, res) => {
  try {
    // Find all enrollments for the student
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id }
    });
    
    const enrollmentIds = enrollments.map(enrollment => enrollment.id);
    
    const schedules = await Schedule.findAll({
      where: { enrollmentId: enrollmentIds },
      include: [
        {
          model: Instructor,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'gender']
            }
          ]
        },
        {
          model: Course,
          attributes: ['id', 'name', 'type']
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting student schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new schedule (instructor/manager only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, startTime, endTime, instructorId, courseId, enrollmentId } = req.body;
    
    // Validate the user is either the instructor or a manager
    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    const isUserInstructor = instructor.userId === req.user.id;
    const isUserManager = req.user.role === 'manager';
    
    if (!isUserInstructor && !isUserManager) {
      return res.status(403).json({ error: 'You are not authorized to create schedules for this instructor' });
    }
    
    // Check for time conflicts
    const existingSchedules = await Schedule.findAll({
      where: { 
        instructorId,
        date
      }
    });
    
    // Check if there's a time conflict
    const hasConflict = existingSchedules.some(schedule => {
      const scheduleStart = new Date(`2000-01-01T${schedule.startTime}`);
      const scheduleEnd = new Date(`2000-01-01T${schedule.endTime}`);
      const newStart = new Date(`2000-01-01T${startTime}`);
      const newEnd = new Date(`2000-01-01T${endTime}`);
      
      return (
        (newStart >= scheduleStart && newStart < scheduleEnd) ||
        (newEnd > scheduleStart && newEnd <= scheduleEnd) ||
        (newStart <= scheduleStart && newEnd >= scheduleEnd)
      );
    });
    
    if (hasConflict) {
      return res.status(400).json({ error: 'Time slot conflicts with an existing schedule' });
    }
    
    // Create schedule
    const schedule = await Schedule.create({
      date,
      startTime,
      endTime,
      instructorId,
      courseId,
      enrollmentId
    });
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update schedule (instructor/manager only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, status } = req.body;
    
    const schedule = await Schedule.findByPk(id, {
      include: [
        {
          model: Instructor
        }
      ]
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Validate the user is either the instructor or a manager
    const isUserInstructor = schedule.Instructor.userId === req.user.id;
    const isUserManager = req.user.role === 'manager';
    
    if (!isUserInstructor && !isUserManager) {
      return res.status(403).json({ error: 'You are not authorized to update this schedule' });
    }
    
    // Check for time conflicts if time is changed
    if (date !== schedule.date || startTime !== schedule.startTime || endTime !== schedule.endTime) {
      const existingSchedules = await Schedule.findAll({
        where: { 
          instructorId: schedule.instructorId,
          date: date || schedule.date,
          id: { [Op.ne]: id } // Exclude current schedule
        }
      });
      
      // Check if there's a time conflict
      const hasConflict = existingSchedules.some(existingSchedule => {
        const scheduleStart = new Date(`2000-01-01T${existingSchedule.startTime}`);
        const scheduleEnd = new Date(`2000-01-01T${existingSchedule.endTime}`);
        const newStart = new Date(`2000-01-01T${startTime || schedule.startTime}`);
        const newEnd = new Date(`2000-01-01T${endTime || schedule.endTime}`);
        
        return (
          (newStart >= scheduleStart && newStart < scheduleEnd) ||
          (newEnd > scheduleStart && newEnd <= scheduleEnd) ||
          (newStart <= scheduleStart && newEnd >= scheduleEnd)
        );
      });
      
      if (hasConflict) {
        return res.status(400).json({ error: 'Time slot conflicts with an existing schedule' });
      }
    }
    
    // Update schedule
    await schedule.update({
      date: date || schedule.date,
      startTime: startTime || schedule.startTime,
      endTime: endTime || schedule.endTime,
      status: status || schedule.status
    });
    
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule (instructor/manager only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findByPk(id, {
      include: [
        {
          model: Instructor
        }
      ]
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Validate the user is either the instructor or a manager
    const isUserInstructor = schedule.Instructor.userId === req.user.id;
    const isUserManager = req.user.role === 'manager';
    
    if (!isUserInstructor && !isUserManager) {
      return res.status(403).json({ error: 'You are not authorized to delete this schedule' });
    }
    
    await schedule.destroy();
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;