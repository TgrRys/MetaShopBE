const Product = require('../models/productModel.js');
const User = require('../models/userModel.js')
const Order = require('../models/orderModel.js');
const Payment = require('../models/paymentModel.js');
const Coupon = require('../models/couponModel.js');
const asyncHandler = require('express-async-handler');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json({
        code: "200",
        status: "OK",
        success: true,
        message: "Users retrieved successfully",
        data: users
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: "User not found",
            data: {}
        });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: "User deleted successfully",
            data: {}
        });
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: "User not found",
            data: {}
        });
    }
});

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const addProduct = asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.remove();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({}).populate('user', 'id name');
    res.json(payments);
});

const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id).populate('user', 'name email');

    if (payment) {
        res.json(payment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});

const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json(coupons);
});

const addCoupon = asyncHandler(async (req, res) => {
    const coupon = new Coupon(req.body);
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { code, discount, expiryDate, isActive } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.code = code;
        coupon.discount = discount;
        coupon.expiryDate = expiryDate;
        coupon.isActive = isActive;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        await coupon.remove();
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: "Coupon not found",
            data: {}
        });
    }
});

module.exports = { getAllUsers, getUserById, deleteUser, getAllProducts, getProductById, addProduct, updateProduct, deleteProduct, getAllOrders, getOrderById, getAllPayments, getPaymentById, getAllCoupons, addCoupon, updateCoupon, deleteCoupon }