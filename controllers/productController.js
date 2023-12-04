const Product = require('../models/Product');

const getProducts = async (req, res) => {
    const { search, category } = req.query;

    let query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' }; // case insensitive search in product name
    }

    if (category) {
        query.category = category;
    }

    const products = await Product.find(query).sort('category');
    res.json(products);
};

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).sort('category');
    res.json(products);
};

const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

const createProduct = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const newProduct = new Product(req.body);
    const createdProduct = await newProduct.save();
    if (createdProduct) {
        res.status(201).json(createdProduct);
    } else {
        res.status(500).json({ message: 'Error in creating product' });
    }
};

const updateProduct = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        } else {
            res.status(500).json({ message: 'Error in updating product' });
        }
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

const deleteProduct = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const deletedProduct = await Product.findById(req.params.id);
    if (deletedProduct) {
        await deletedProduct.remove();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = {
    getProducts,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};