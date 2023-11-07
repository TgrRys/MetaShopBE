const express = require('express')
const router = express.Router()
const { createOrder, getOrderById, getOrdersByUser } = require('../controllers/orderController.js')
const { protect } = require('../middleWare/authMiddleWare.js')
// const duitkuConfig = require('../../config/duitku-config.js');

// router.route('/').post(protect, addOrderItems)
// router.route('/myorders').get(protect, getMyOrders)
// router.route('/:id').get(protect, getOrderById)
// router.route('/:id/pay').put(protect, updateOrderToPaid)
router.post('/create-order', protect, createOrder);
router.get('/:id', protect, getOrderById);
router.get('/user/:userId', protect, getOrdersByUser);

module.exports = router