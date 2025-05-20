const express = require('express');
const router = express.Router();
const { Course, DrivingSchool } = require('../models');
const { authenticateToken, isManager } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: {
        model: DrivingSchool,
        attributes: ['id', 'name']
      }
    });
    res.json(courses);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get courses by driving school
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const courses = await Course.findAll({
      where: { drivingSchoolId: schoolId },
      order: [['type', 'ASC']] // Order by course type (code, parking, road)
    });
    res.json(courses);
  } catch (error) {
    console.error('Error getting courses by school:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get course by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: {
        model: DrivingSchool,
        attributes: ['id', 'name']
      }
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new course (manager only)
router.post('/', authenticateToken, isManager, async (req, res) => {
  try {
    const { name, description, type, price, duration, drivingSchoolId, content } = req.body;
    
    // Check if driving school exists
    const drivingSchool = await DrivingSchool.findByPk(drivingSchoolId);
    if (!drivingSchool) {
      return res.status(404).json({ error: 'Driving school not found' });
    }
    
    // Check if the manager is managing this driving school
    if (req.user.role === 'manager' && drivingSchool.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to create courses for this driving school' });
    }
    
    // Create course
    const course = await Course.create({
      name,
      description,
      type,
      price,
      duration,
      drivingSchoolId,
      content
    });
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update course (manager only)
router.put('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, price, duration, content } = req.body;
    
    const course = await Course.findByPk(id, {
      include: {
        model: DrivingSchool,
        attributes: ['id', 'managerId']
      }
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if the manager is managing this driving school
    if (req.user.role === 'manager' && course.DrivingSchool.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to update courses for this driving school' });
    }
    
    await course.update({
      name,
      description,
      type,
      price,
      duration,
      content
    });
    
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete course (manager only)
router.delete('/:id', authenticateToken, isManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      include: {
        model: DrivingSchool,
        attributes: ['id', 'managerId']
      }
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if the manager is managing this driving school
    if (req.user.role === 'manager' && course.DrivingSchool.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete courses for this driving school' });
    }
    
    await course.destroy();
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;