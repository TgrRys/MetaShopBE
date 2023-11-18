const User = require('../models/userModel.js')
const asyncHandler = require('express-async-handler')

const protectAdmin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
});

module.exports = { protectAdmin };