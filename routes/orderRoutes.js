const express = require('express')
const router = express.Router()
const { createOrder, getOrderById, getOrdersByUser, updateOrder, deleteOrder } = require('../controllers/orderController.js')
const { protect } = require('../middleware/authMiddleWare.js');
const { route } = require('./userRoutes.js');

router.post('/create', protect, createOrder);
router.delete('/delete/:id', protect, deleteOrder);
router.put('/edit/:id', protect, updateOrder);
router.get('/detail/:id', protect, getOrderById);
router.get('/user/:userId', protect, getOrdersByUser);

module.exports = router