const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    color: String,
    size: String
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: String,
    required: true
  }
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed, 
    required: false 
  },
  paymentMethod: {
    type: String,
    required: true,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;