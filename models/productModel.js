const mongoose = require('mongoose')

const variantSchema = mongoose.Schema({
    color: String,
    size: String,
    quantity: Number
}, {
    _id: false
});

const productSchema = mongoose.Schema({
    name: String,
    subtitle: String,
    description: String,
    variants: [variantSchema],
    category: {
        type: String,
        default: 'none',
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    images: {
        main: String,
        sub: String
    },
    featured: {
        type: Boolean,
        required: true,
        default: false
    },
    imgSrc: {
        type: Array
    }
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product