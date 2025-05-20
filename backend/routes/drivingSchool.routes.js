const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const drivingSchoolController = require('../controllers/drivingSchool.controller');

// Public routes
router.get('/', drivingSchoolController.getAllDrivingSchools);
router.get('/:id', drivingSchoolController.getDrivingSchoolById);

// Protected routes
router.post('/', auth, checkRole('manager', 'admin'), drivingSchoolController.createDrivingSchool);
router.put('/:id', auth, checkRole('manager', 'admin'), drivingSchoolController.updateDrivingSchool);

module.exports = router;
