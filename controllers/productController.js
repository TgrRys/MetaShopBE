const { Product } = require('../models/productModel');

const getProducts = async (req, res) => {
    const { search, sort } = req.query;

    let query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    let products = await Product.find(query);

    if (sort) {
        switch (sort) {
            case 'newest':
                products.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'lowest':
                products.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'highest':
                products.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            default:
                break;
        }
    }

    res.status(200).json({
        code: 200,
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort('category');
        res.status(200).json({
            code: 200,
            status: 'success',
            results: products.length,
            data: {
                products
            }
        })
    } catch (err) {
        res.status(500).json({
            code: 500,
            status: 'error',
            message: err.message
        });
    }
};

const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.status(200).json({
            code: 200,
            status: 'success',
            data: {
                product
            }
        });
    } else {
        res.status(404).json({
            code: 404,
            status: 'error',
            message: 'Product not found'
        });
    }
};

const getProductCategory = async (req, res) => {
    const { category } = req.query;

    let query = {};
    if (category) {
        query.category = category;
    }

    const products = await Product.find(query);
    res.status(200).json({
        code: 200,
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
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
    getProductCategory,
    createProduct,
    updateProduct,
    deleteProduct
};