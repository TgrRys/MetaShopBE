const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, required: true, default: true },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;