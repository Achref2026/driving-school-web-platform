const { DrivingSchool, User } = require('../models');

// Get all driving schools
exports.getAllDrivingSchools = async (req, res) => {
  try {
    const { region } = req.query;
    
    let whereClause = {};
    if (region) {
      whereClause.region = region;
    }
    
    const drivingSchools = await DrivingSchool.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'manager',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });
    
    res.json(drivingSchools);
  } catch (error) {
    console.error('Error fetching driving schools:', error);
    res.status(500).json({ message: 'Server error fetching driving schools', error: error.message });
  }
};

// Get driving school by ID
exports.getDrivingSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drivingSchool = await DrivingSchool.findByPk(id, {
      include: [{
        model: User,
        as: 'manager',
        attributes: ['firstName', 'lastName', 'email']
      }, {
        model: User,
        as: 'instructors',
        attributes: ['id', 'firstName', 'lastName', 'gender']
      }]
    });
    
    if (!drivingSchool) {
      return res.status(404).json({ message: 'Driving school not found' });
    }
    
    res.json(drivingSchool);
  } catch (error) {
    console.error('Error fetching driving school:', error);
    res.status(500).json({ message: 'Server error fetching driving school', error: error.message });
  }
};

// Create a new driving school
exports.createDrivingSchool = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      address, 
      region, 
      contactPhone, 
      contactEmail, 
      logo,
      courses,
      priceCode,
      priceParking,
      priceRoad,
      hasFemaleTutors,
      hasMaleTutors
    } = req.body;

    // Create the driving school
    const drivingSchool = await DrivingSchool.create({
      name,
      description,
      address,
      region,
      contactPhone,
      contactEmail,
      logo,
      courses: courses || [],
      priceCode: priceCode || 0,
      priceParking: priceParking || 0,
      priceRoad: priceRoad || 0,
      hasFemaleTutors: hasFemaleTutors || false,
      hasMaleTutors: hasMaleTutors || false,
      managerId: req.user.id
    });

    res.status(201).json({
      message: 'Driving school created successfully',
      drivingSchool
    });
  } catch (error) {
    console.error('Error creating driving school:', error);
    res.status(500).json({ message: 'Server error creating driving school', error: error.message });
  }
};

// Update a driving school
exports.updateDrivingSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const drivingSchool = await DrivingSchool.findByPk(id);
    
    if (!drivingSchool) {
      return res.status(404).json({ message: 'Driving school not found' });
    }
    
    // Check if user is the manager of this driving school
    if (drivingSchool.managerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this driving school' });
    }
    
    // Update the driving school
    await drivingSchool.update(updates);
    
    res.json({
      message: 'Driving school updated successfully',
      drivingSchool
    });
  } catch (error) {
    console.error('Error updating driving school:', error);
    res.status(500).json({ message: 'Server error updating driving school', error: error.message });
  }
};
