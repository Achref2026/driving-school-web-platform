const express = require('express');
const router = express.Router();
const { Instructor, User, DrivingSchool } = require('../models');
const { authenticateToken, isManager } = require('../middleware/auth');

// Get all instructors (admin/manager only)
router.get('/', authenticateToken, isManager, async (req, res) => {
  try {
    const instructors = await Instructor.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'gender']
        },
        {
          model: DrivingSchool,
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(instructors);
  } catch (error) {
    console.error('Error getting instructors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get instructors by driving school
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const instructors = await Instructor.findAll({
      where: { drivingSchoolId: schoolId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'gender']
        }
      ]
    });
    res.json(instructors);
  } catch (error) {
    console.error('Error getting instructors by school:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get instructor by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'gender']
        },
        {
          model: DrivingSchool,
          attributes: ['id', 'name', 'address', 'phone', 'email']
        }
      ]
    });
    
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    res.json(instructor);
  } catch (error) {
    console.error('Error getting instructor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new instructor (manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { userId, drivingSchoolId, specialization } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if driving school exists
    const drivingSchool = await DrivingSchool.findByPk(drivingSchoolId);
    if (!drivingSchool) {
      return res.status(404).json({ error: 'Driving school not found' });
    }
    
    // Check if user is already an instructor
    const existingInstructor = await Instructor.findOne({ where: { userId } });
    if (existingInstructor) {
      return res.status(400).json({ error: 'User is already an instructor' });
    }
    
    // Create instructor
    const instructor = await Instructor.create({
      userId,
      drivingSchoolId,
      specialization
    });
    
    // Update user role to 'instructor'
    await user.update({ role: 'instructor' });
    
    res.status(201).json(instructor);
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update instructor (manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization } = req.body;
    
    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    await instructor.update({ specialization });
    
    res.json(instructor);
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete instructor (manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    // Get the user and update role back to 'user'
    const user = await User.findByPk(instructor.userId);
    if (user) {
      await user.update({ role: 'user' });
    }
    
    await instructor.destroy();
    
    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;