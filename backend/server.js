const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const routes = require('./routes');
require('dotenv').config();

// Init express
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB
connectDB();

// API Routes - all routes prefixed with /api
app.use('/api', routes);

// Root route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Driving School Management API is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});