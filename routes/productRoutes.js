const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProducts } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleWare');

router.get('/', getProducts);
router.get('/all', getAllProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
