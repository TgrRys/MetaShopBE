const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleWare.js')
const { createPayment, getPaymentById, getPaymentsByUser, getPaymentStatus } = require('../controllers/paymentController.js');

router.post('/process', protect, createPayment);
router.get('/status/user/:userId', protect, getPaymentStatus);
router.get('/detail/:id', protect, getPaymentById);
router.get('/history/:userId', protect, getPaymentsByUser);


module.exports = router