const express = require('express');
const router = express.Router();
const { DrivingSchool, Instructor, User, Course } = require('../models');

// Get all driving schools
router.get('/', async (req, res) => {
  try {
    const drivingSchools = await DrivingSchool.findAll({
      attributes: [
        'id',
        'name',
        'address',
        'region',
        'phoneNumber',
        'email',
        'description',
        'licenseNumber',
        'logoUrl',
        'rating',
        'hasFemaleInstructors',
        'hasMaleInstructors'
      ]
    });
    res.json(drivingSchools);
  } catch (error) {
    console.error('Error getting driving schools:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get driving schools by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const drivingSchools = await DrivingSchool.findAll({
      where: { region },
      attributes: [
        'id',
        'name',
        'address',
        'region',
        'phoneNumber',
        'email',
        'description',
        'licenseNumber',
        'logoUrl',
        'rating',
        'hasFemaleInstructors',
        'hasMaleInstructors'
      ]
    });
    res.json(drivingSchools);
  } catch (error) {
    console.error('Error getting driving schools by region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get driving school by ID with instructors and courses
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const drivingSchool = await DrivingSchool.findByPk(id);
    
    if (!drivingSchool) {
      return res.status(404).json({ message: 'Driving school not found' });
    }

    // Get instructors
    const instructors = await Instructor.findAll({
      where: { drivingSchoolId: id },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'gender']
        }
      ]
    });

    // Get courses
    const courses = await Course.findAll({
      where: { drivingSchoolId: id }
    });

    res.json({
      drivingSchool,
      instructors,
      courses
    });
  } catch (error) {
    console.error('Error getting driving school details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register a new driving school
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      address,
      region,
      phoneNumber,
      email,
      description,
      licenseNumber,
      logoUrl,
      hasFemaleInstructors,
      hasMaleInstructors
    } = req.body;

    const drivingSchool = await DrivingSchool.create({
      name,
      address,
      region,
      phoneNumber,
      email,
      description,
      licenseNumber,
      logoUrl,
      hasFemaleInstructors,
      hasMaleInstructors
    });

    res.status(201).json({
      message: 'Driving school registered successfully',
      drivingSchool
    });
  } catch (error) {
    console.error('Error registering driving school:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;