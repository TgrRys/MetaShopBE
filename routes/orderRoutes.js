const express = require('express')
const router = express.Router()
const { createOrder, getOrderById, getOrdersByUser } = require('../controllers/orderController.js')
const { protect } = require('../middleware/authMiddleWare.js');

router.post('/create', protect, createOrder);
router.get('/detail/:id', protect, getOrderById);
router.get('/user/orders/:userId', protect, getOrdersByUser);

module.exports = router