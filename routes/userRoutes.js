const express = require('express')
const router = express.Router()
const { authUser, registerUser, updateUserProfile, sendOtp, verifyOtp, resetPassword, forgotPassword, resetPasswordWithOtp, addToCart, removeFromCart, addToWishlist, removeFromWishlist, checkEmailUser, getProfile, getUserProfile, getWishlist, getCart, editToCart } = require('../controllers/userController.js')
const { protect } = require('./../middleware/authMiddleWare.js')
const validation = require('../controllers/uploads/validation.js')

router.post('/otp/send', sendOtp)
router.post('/otp/verify', verifyOtp)
router.route('/register').post(registerUser)
router.post('/login', authUser)
router.post('/check-email', checkEmailUser)
router.route('/profile').get(protect, getUserProfile);
router.put('/profile/edit', validation, protect, updateUserProfile)
router.post('/password/reset', resetPassword)
router.post('/password/forgot', forgotPassword);
router.post('/password/create-new', resetPasswordWithOtp);
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.put('/cart/edit', protect, editToCart);
router.delete('/cart/remove/:productId', protect, removeFromCart);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/add', protect, addToWishlist);
router.delete('/wishlist/remove/:productId', protect, removeFromWishlist);




module.exports = router