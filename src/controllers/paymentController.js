const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const midtransClient = require('midtrans-client');
const User = require('../models/userModel');
const axios = require('axios');


const createPayment = async (req, res) => {
    try {

        const { user: userId, order, coupon, paymentMethod } = req.body;

        // Fetch the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the order
        const fetchedOrder = await Order.findById(order).populate('orderItems.product');

        let totalAmount = 0;
        fetchedOrder.orderItems.forEach(item => {
            totalAmount += item.qty * item.product.price;
        });

        // Fetch the coupon
        const fetchedCoupon = await Coupon.findById(coupon);

        // Calculate the discount
        const discount = fetchedCoupon ? fetchedCoupon.discount : 0;

        // Calculate the final amount
        const finalAmount = totalAmount - discount;

        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });

        const parameter = {
            transaction_details: {
                order_id: order,
                gross_amount: finalAmount,
            },
            item_details: fetchedOrder.orderItems.map(item => ({
                id: item.product._id,
                price: item.product.price,
                quantity: item.qty,
                name: item.product.name,
                brand: item.product.brand
            })),
            customer_details: {
                email: user.email,
                shipping_address: {
                    address: user.addresses[0].street,
                    city: user.addresses[0].city,
                    postal_code: user.addresses[0].postalCode
                },
            },
        };

        snap.createTransaction(parameter).then((transaction) => {
            const dataPayment = {
                response: JSON.stringify(transaction)
            }

            const token = transaction.token;
            // console.log(transaction);
            const payment = new Payment({
                user,
                order,
                coupon,
                totalAmount: finalAmount,
                paymentMethod,
                token
            });

            const createdPayment = payment.save();

            res.status(200).json({
                message: "success", dataPayment, token: token, payment: createdPayment, order: order

            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        // Check for the Authorization header
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No authentication token, authorization denied" });
        }

        const { orderId } = req.params;

        // Fetch the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch the payment
        const payment = await Payment.findOne({ order: orderId });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Get the payment status from Midtrans API
        const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:` /* password is blank */).toString('base64')
            }
        });

        const paymentStatus = response.data;

        // If the payment was successful, mark the payment as paid
        if (paymentStatus.status_code === "200") {
            payment.isPaid = true;
            await payment.save();
        }

        res.status(200).json({ paymentStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaymentById = async (req, res) => {
    const payment = await Payment.findById(req.params.id).populate('user').populate('order').populate('coupon');

    if (payment) {
        res.json(payment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
};

const getPaymentsByUser = async (req, res) => {
    const payments = await Payment.find({ user: req.params.userId }).populate('user').populate('order').populate('coupon');

    res.json(payments);
};

module.exports = {
    createPayment,
    getPaymentById,
    getPaymentsByUser,
    getPaymentStatus
};
