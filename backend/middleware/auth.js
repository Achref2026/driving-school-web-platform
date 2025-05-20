const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
      }
      
      // Get user from database
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check if user is a manager
const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied: Manager role required' });
  }
  next();
};

// Middleware to check if user is an instructor
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Access denied: Instructor role required' });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied: Student role required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isManager,
  isInstructor,
  isStudent
};