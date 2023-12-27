const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const midtransClient = require('midtrans-client');
const User = require('../models/userModel');
const axios = require('axios');


// const createPayment = async (req, res) => {
//     try {
//         const { user: userId, order, coupon, paymentMethod } = req.body;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 code: "404",
//                 status: "Not Found",
//                 success: false,
//                 message: "User not found",
//                 data: {}
//             });
//         }

//         const fetchedOrder = await Order.findById(order).populate('orderItems.product');
//         if (!fetchedOrder) {
//             return res.status(404).json({
//                 code: "404",
//                 status: "Not Found",
//                 success: false,
//                 message: "Order not found",
//                 data: {}
//             });
//         }

//         let totalAmount = fetchedOrder.orderItems.reduce((acc, item) => acc + item.qty * item.product.price, 0);

//         let discount = 0;
//         if (coupon) {
//             const fetchedCoupon = await Coupon.findById(coupon);
//             discount = fetchedCoupon ? fetchedCoupon.discount : 0;
//         }
//         const finalAmount = totalAmount - discount;

//         const snap = new midtransClient.Snap({
//             isProduction: false,
//             serverKey: process.env.MIDTRANS_SERVER_KEY,
//             clientKey: process.env.MIDTRANS_CLIENT_KEY,
//         });

//         const parameter = {
//             transaction_details: {
//                 order_id: order,
//                 gross_amount: finalAmount,
//             },
//             item_details: fetchedOrder.orderItems.map(item => ({
//                 id: item.product._id,
//                 price: Math.floor(item.product.price), // Ensure the price is an integer
//                 quantity: item.qty,
//                 name: item.product.name.substring(0, 49), // Ensure the name is not too long
//             })),
//             customer_details: {
//                 email: user.email,
//                 shipping_address: fetchedOrder.shippingAddress,
//             },
//         };

//         snap.createTransaction(parameter).then((transaction) => {
//             const dataPayment = {
//                 response: JSON.stringify(transaction)
//             }

//             const token = transaction.token;
//             const payment = new Payment({
//                 user,
//                 order,
//                 coupon,
//                 totalAmount: finalAmount,
//                 paymentMethod,
//                 token
//             });

//             const createdPayment = payment.save();

//             res.status(200).json({
//                 code: "200",
//                 status: "OK",
//                 success: true,
//                 message: "Payment created successfully",
//                 data: {
//                     dataPayment: dataPayment,
//                     token: token,
//                     payment: createdPayment,
//                     order: order
//                 }
//             });
//         });
//     } catch (error) {
//         res.status(500).json({
//             code: "500",
//             status: "Internal Server Error",
//             success: false,
//             message: error.message,
//             data: {}
//         });
//     }
// };

const createPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user').populate('orderItems.product');
        if (!order) {
            return res.status(404).json({
                code: "404",
                status: "Not Found",
                success: false,
                message: "Order not found",
                data: {}
            });
        }

        let totalAmount = order.orderItems.reduce((acc, item) => acc + item.quantity * parseFloat(item.product.price.replace(".", "")), 0);

        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: totalAmount,
            },
            item_details: order.orderItems.map(item => ({
                id: item.product._id,
                price: parseFloat(item.product.price.replace(".", "")),
                quantity: item.quantity,
                name: item.product.name.substring(0, 49),
            })),
            customer_details: {
                email: order.user.email,
                shipping_address: order.shippingAddress || order.user.shippingAddress,
            },
        };

        console.log('order.user:', order.user);
        console.log('parameter:', parameter);
        snap.createTransaction(parameter).then((transaction) => {
            const dataPayment = {
                response: JSON.stringify(transaction)
            }

            const token = transaction.token;
            const payment = new Payment({
                user: order.user,
                order,
                totalAmount,
                token,
                paymentMethod: order.paymentMethod 
            });

            const createdPayment = payment.save();

            res.status(200).json({
                code: "200",
                status: "OK",
                success: true,
                message: "Payment created successfully",
                data: {
                    dataPayment: dataPayment,
                    token: token,
                    payment: createdPayment,
                    order: order
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "Internal Server Error",
            success: false,
            message: error.message,
            data: {}
        });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "No authentication token, authorization denied" });
        }

        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                code: "404",
                status: "Not Found",
                success: false,
                message: "Order not found",
                data: {}
            });
        }

        const payment = await Payment.findOne({ order: orderId });
        if (!payment) {
            return res.status(404).json({
                code: "404",
                status: "Not Found",
                success: false,
                message: "Payment not found",
                data: {}
            });
        }

        const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')
            }
        });

        const paymentStatus = response.data;

        if (paymentStatus.status_code === "200") {
            payment.isPaid = true;
            await payment.save();
        }

        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: "Payment status fetched successfully",
            data: paymentStatus
        });
    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "Internal Server Error",
            success: false,
            message: error.message,
            data: {}
        });
    }
};

const getPaymentById = async (req, res) => {
    const payment = await Payment.findById(req.params.id).populate('user').populate('order').populate('coupon');

    if (payment) {
        res.json(payment);
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: "Payment not found",
            data: {}
        });
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
