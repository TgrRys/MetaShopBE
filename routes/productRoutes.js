const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProducts, getProductCategory } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleWare');

router.get('/', getProducts);
router.get('/all', getAllProducts);
router.get('/filter', getProductCategory); 
router.get('/:id', getProductById);
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
