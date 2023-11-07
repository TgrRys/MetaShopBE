const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const createOrder = async (req, res) => {
    const { user, orderItems } = req.body;

    const order = new Order({
        user,
        orderItems
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
};

// Get a single order by id
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user').populate('orderItems.product');
  
    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
};
  
// Get all orders for a user
const getOrdersByUser = async (req, res) => {
    const orders = await Order.find({ user: req.params.userId }).populate('user').populate('orderItems.product');
  
    res.json(orders);
};

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUser
};