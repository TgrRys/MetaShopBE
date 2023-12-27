const express = require('express')
const router = express.Router()
const { createOrder, getOrderById, getOrdersByUser, updateOrder } = require('../controllers/orderController.js')
const { protect } = require('../middleware/authMiddleWare.js');

router.post('/create', protect, createOrder);
router.put('/edit/:id', protect, updateOrder);
router.get('/detail/:id', protect, getOrderById);
router.get('/user/:userId', protect, getOrdersByUser);

module.exports = router