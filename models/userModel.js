const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { variantSchema } = require('./productModel.js');

const addressSchema = mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
}, {
    _id: false
})

const wishlistItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, {
    _id: false
});

const cartItemSchema = mongoose.Schema({
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

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
    },
    addresses: [addressSchema],
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    otp: {
        type: String,
        unique: true,
        sparse: true
    },
    otpCreatedAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    cart: [cartItemSchema],
    wishlist: [wishlistItemSchema]
}, {
    timestamps: true
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

module.exports = User