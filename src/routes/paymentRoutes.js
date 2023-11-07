const express = require('express')
const router = express.Router()
// const { protect } = require('../middleWare/authMiddleWare.js')
const { protect } = require('./../middleware/authMiddleWare.js')
const { createPayment, getPaymentById, getPaymentsByUser, getPaymentStatus } = require('../controllers/paymentController.js');

router.post('/process-payment', protect, createPayment);
router.get('/payment-status/:orderId', protect, getPaymentStatus);
router.get('/payment/:id', protect, getPaymentById);
router.get('/user/:userId', protect, getPaymentsByUser);


module.exports = router



// import express from "express";
// import midtransClient from "midtrans-client";

// const router = express.Router();

// router.post("/process-payment", async (req, res) => {
//     try {
//         const snap = new midtransClient.Snap({
//             isProduction: false,
//             serverKey: process.env.MIDTRANS_SERVER_KEY,
//             clientKey: process.env.MIDTRANS_CLIENT_KEY,
//         });

//         const parameter = {
//             transaction_details: {
//                 order_id: "ORDER-101",
//                 gross_amount: 10000,
//             },
//             item_details: [{
//                 price: 10000,
//                 quantity: 1,
//                 merchant_name: "Midtrans"
//             }],
//             customer_details: {
//                 email: "tes@gmail.com",
//                 shipping_address: {
//                     address: "tes",
//                     city: "city",
//                     postal_code: "12345"
//                 },
//             },

//         };

//         snap.createTransaction(parameter).then((transaction) => {
//             const dataPayment = {
//                 response: JSON.stringify(transaction)
//             }

//             const token = transaction.token;

//             res.status(200).json({message: "success", dataPayment, token: token });
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });