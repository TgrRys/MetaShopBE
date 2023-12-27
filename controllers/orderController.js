const expressAsyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

const createOrder = expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    try {
        const { orderItems } = req.body;

        const order = new Order({
            user: req.user._id,
            orderItems: orderItems.map((item) => {
                return {
                    product: item.product,
                    variant: item.variant,
                    quantity: item.quantity,
                    price: item.price
                };
            }),
            paymentMethod: 'credit_card', 
        });
        await order.save();

        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter(item => !orderItems.find(orderItem => orderItem.product === item.product));
        await user.save();

        res.status(201).json({ status: 'success', order: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
    
});

const updateOrder = expressAsyncHandler(async (req, res) => {
    const { shippingAddress, orderedItems } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        const user = await User.findById(order.user);
        if (user) {
            if (typeof shippingAddress === 'number' && shippingAddress >= 0 && shippingAddress < user.addresses.length) {
                order.shippingAddress = user.addresses[shippingAddress]; 
                const updatedOrder = await order.save();

                if (orderedItems) {
                    req.user.cart = req.user.cart.filter((item, index) => !orderedItems.includes(index));
                }
                await req.user.save();

                res.status(200).json({ status: 'success', order: updatedOrder });
            } else {
                res.status(400).json({ status: 'error', message: 'Invalid shipping address' });
            }
        } else {
            res.status(404).json({ status: 'error', message: 'User not found' });
        }
    } else {
        res.status(404).json({ status: 'error', message: 'Order not found' });
    }
});

// Get a single order by id
const getOrderById = expressAsyncHandler(async (req, res) => {
    const id = req.params.id;

    if (id.length !== 24) {
        return res.status(400).json({ status: 'error', message: 'Invalid order ID' });
    }

    const order = await Order.findById(id).populate('user').populate('orderItems.product');

    if (order) {
        res.json({ status: 'success', order: order });
    } else {
        res.status(404).json({ status: 'error', message: 'Order not found' });
    }
});

const getOrdersByUser = expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.params.userId }).populate('user').populate('orderItems.product');

    res.json({ status: 'success', orders: orders });
});


module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUser,
    updateOrder
};