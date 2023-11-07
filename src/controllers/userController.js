const User = require('../models/userModel.js')
const asyncHandler = require('express-async-handler')
const generateToken = require('../utils/generateToken.js')
const cloudinary = require("../controllers/uploads/cloudinary.js")
// const otpGenerator = require('otp-generator')
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6);

    const user = await User.create({
        email,
        otp,
    })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // your email
            pass: process.env.EMAIL_PASSWORD // your email password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL, // your email
        to: user.email,
        subject: 'Your OTP',
        text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    if (user) {
        res.status(201).json({
            message: 'OTP sent to email'
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    // Find user by OTP
    const user = await User.findOne({ otp });
    if (!user) {
        res.status(404);
        throw new Error('OTP not found');
    }

    console.log('OTP from database:', user.otp);
    console.log('OTP from request:', otp);

    // If otpCreatedAt is not set, throw an error
    if (!user.otpCreatedAt) {
        res.status(500);
        throw new Error('OTP creation time not found');
    }

    console.log('OTP creation time:', user.otpCreatedAt);
    console.log('Time difference:', Date.now() - new Date(user.otpCreatedAt).getTime());

    // Verify OTP and check if it has expired
    const otpIsValid = user.otp === otp;
    const otpHasExpired = Date.now() - new Date(user.otpCreatedAt).getTime() > 5 * 60 * 1000; // 5 minutes

    console.log('OTP is valid:', otpIsValid);
    console.log('OTP has expired:', otpHasExpired);

    if (otpIsValid && !otpHasExpired) {
        // Set isVerified to true
        user.isVerified = true;
        await user.save();

        // Generate JWT with user ID and OTP
        const token = jwt.sign({ id: user._id, otp }, process.env.JWT_SECRET, { expiresIn: '10m' });

        res.status(200).json({ message: 'OTP verified', token, otpCreatedAt: user.otpCreatedAt });
    } else {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })

    if (!user) {
        res.status(401)
        throw new Error('Invalid email or password')
    }

    if (!user.isVerified) {
        res.status(401)
        throw new Error('Please verify your OTP first')
    }

    if (await user.matchPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            addresses: user.addresses,
            token: generateToken(user._id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            addresses: user.addresses,
        })
    } else {
        res.status(404)
        throw new Error('USER NOT FOUND')
    }
})

const updateUserProfile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (req.file == null) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.addresses = req.body.addresses || user.addresses;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.status(200).json({ message: "Update successfully" });
        } else {
            if (user.image) {
                const userImage = user.image;

                const imageID = userImage.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`user/${imageID}`);
            }

            const fileBase64 = req.file.buffer.toString("base64");
            const file = `data:${req.file.mimetype};base64,${fileBase64}`;

            cloudinary.uploader.upload(file, { folder: "user" }, async function (err, result) {
                if (!!err) {
                    res.status(400).json({
                        status: "UPLOAD FAIL",
                        errors: err.message,
                    });
                    return;
                }

                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                user.image = result.url || user.image;
                user.addresses = req.body.addresses || user.addresses;
                if (req.body.password) {
                    user.password = req.body.password;
                }
                const updatedUser = await user.save();
                res.status(200).json({ message: "Update successfully" });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const user = await User.findOne({ email: email })

    if (!user) {
        res.status(400)
        throw new Error('User not found')
    }

    if (!user.isVerified) {
        res.status(400)
        throw new Error('Please verify your OTP first')
    }

    user.name = name
    user.password = password

    await user.save()

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
    })
})

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const token = req.headers.authorization.split(' ')[1]; // Assumes 'Bearer <token>'

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Reset password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and otpCreatedAt to user
    user.otp = otp;
    user.otpCreatedAt = Date.now();
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // your email
            pass: process.env.EMAIL_PASSWORD // your email password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for forgot password',
        text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.status(200).json({ message: 'OTP sent to email, please check your email' });
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body;

    // Find user by OTP
    const user = await User.findOne({ otp });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if OTP has expired
    const otpHasExpired = Date.now() - new Date(user.otpCreatedAt).getTime() > 5 * 60 * 1000; // 5 minutes
    if (otpHasExpired) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    // Reset password
    user.password = newPassword;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);

    const item = {
        product: productId,
        quantity,
        price: product.price
    };

    user.cart.push(item);
    await user.save();

    res.status(200).json({ message: 'Item added to cart' });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Item removed from cart' });
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    const item = {
        product: productId
    };

    user.wishlist.push(item);
    await user.save();

    res.status(200).json({ message: 'Item added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Item removed from wishlist' });
});


module.exports = { sendOtp, verifyOtp, authUser, getUserProfile, registerUser, updateUserProfile, resetPassword, forgotPassword, resetPasswordWithOtp, addToCart, removeFromCart, addToWishlist, removeFromWishlist }