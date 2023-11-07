const mongoose = require('mongoose')

const orderItemSchema = mongoose.Schema({
  qty: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
}, {
  _id: false
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [orderItemSchema],
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema)

module.exports = Order