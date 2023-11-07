const express = require('express')
const router = express.Router()
const { authUser, getUserProfile, registerUser, updateUserProfile, sendOtp, verifyOtp, resetPassword, forgotPassword, resetPasswordWithOtp, addToCart, removeFromCart, addToWishlist, removeFromWishlist } = require('../controllers/userController.js')
const { protect } = require('./../middleware/authMiddleWare.js')
const validation = require('../controllers/uploads/validation.js')

router.post('/sendOtp', sendOtp)
router.post('/verifyOtp', verifyOtp)
router.route('/register').post(registerUser)
router.post('/login', authUser)
// router.put('/edit-profile', protect, uploadImage, updateUserProfile)
router.put('/edit-profile', validation, protect, updateUserProfile)
router.post('/reset-password', resetPassword)
router.post('/forgot-password', forgotPassword);
router.post('/create-new-password', resetPasswordWithOtp);
router.post('/cart', protect, addToCart);
router.delete('/cart/:productId', protect, removeFromCart);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);


module.exports = router