const { Payment, Enrollment, DrivingSchool } = require('../models');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { enrollmentId, amount, paymentMethod, transactionId } = req.body;
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [{
        model: DrivingSchool,
        as: 'drivingSchool'
      }]
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify that the user is the student in this enrollment
    if (enrollment.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to make payment for this enrollment' });
    }
    
    // Create payment
    const payment = await Payment.create({
      enrollmentId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: new Date(),
      status: 'completed'
    });
    
    // Update enrollment status to active
    await enrollment.update({ status: 'active' });
    
    res.status(201).json({
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error processing payment', error: error.message });
  }
};

// Get all payments for a student
exports.getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Enrollment,
        as: 'enrollment',
        where: { studentId: req.user.id },
        include: [{
          model: DrivingSchool,
          as: 'drivingSchool'
        }]
      }]
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Server error fetching payments', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Enrollment,
        as: 'enrollment',
        include: [{
          model: DrivingSchool,
          as: 'drivingSchool'
        }]
      }]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check authorization
    if (payment.enrollment.studentId !== req.user.id && 
        payment.enrollment.drivingSchool.managerId !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error fetching payment', error: error.message });
  }
};

// Process Algerian payment methods (CIB or Edahabia)
exports.processAlgerianPayment = async (req, res) => {
  try {
    const { enrollmentId, amount, cardType, cardNumber, cardHolderName, expiryDate, cvv } = req.body;
    
    // Validate card information
    if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'All card information fields are required' });
    }
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [{
        model: DrivingSchool,
        as: 'drivingSchool'
      }]
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Verify that the user is the student in this enrollment
    if (enrollment.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to make payment for this enrollment' });
    }
    
    // Mock payment processing - In a real application, this would integrate with a payment gateway
    const transactionId = 'TXN' + Date.now();
    
    // Create payment record
    const payment = await Payment.create({
      enrollmentId,
      amount,
      paymentMethod: cardType, // 'CIB' or 'Edahabia'
      transactionId,
      paymentDate: new Date(),
      status: 'completed'
    });
    
    // Update enrollment status to active
    await enrollment.update({ status: 'active' });
    
    res.status(201).json({
      message: 'Payment processed successfully',
      payment,
      transactionId
    });
  } catch (error) {
    console.error('Error processing Algerian payment:', error);
    res.status(500).json({ message: 'Server error processing payment', error: error.message });
  }
};
