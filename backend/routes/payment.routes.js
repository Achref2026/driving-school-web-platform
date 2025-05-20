const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

// Protected routes
router.post('/', auth, paymentController.createPayment);
router.get('/student', auth, paymentController.getStudentPayments);
router.get('/:id', auth, paymentController.getPaymentById);
router.post('/algerian', auth, paymentController.processAlgerianPayment);

module.exports = router;
