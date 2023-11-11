const express = require('express');
const { protect } = require('../middleware/authMiddleWare');
const { protectAdmin } = require('../middleware/adminMiddleWare');
const { getAllUsers, deleteUser, getUserById } = require('../controllers/adminController');
const router = express.Router()

// Admin
router.route('/users').get(protect, protectAdmin, getAllUsers);
router.route('/users/:id').delete(protect, protectAdmin, deleteUser);
router.route('/users/:id').get(protect, protectAdmin, getUserById);

module.exports = router