const User = require('../models/userModel.js')
const { Product } = require('../models/productModel');
const asyncHandler = require('express-async-handler')
const generateToken = require('../utils/generateToken.js')
const cloudinary = require("./uploads/cloudinary.js")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')

const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'User already exists',
            data: {}
        })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6);

    const user = await User.create({
        email,
        otp,
    })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'OTP for verification email request from MetaShop',
        html: `
            <div style="text-align: center;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/768px-LEGO_logo.svg.png" alt="MetaShop Logo" style="width: 200px;"/>
            </div>
            <br>
            Hi ${user.email},<br><br>
            Your OTP is <b>${otp}</b><br><br>
            The OTP is valid for 5 minutes. <br><br>
            If you did not request this, please ignore this email. <br><br>
            Thanks,<br><br>
            MetaShop Team
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500).json({
                code: "500",
                status: "Internal Server Error",
                success: false,
                message: 'Failed to send email OTP',
                data: {}
            })
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    if (user) {
        res.status(201).json({
            code: "201",
            status: "Created",
            success: true,
            message: 'OTP sent successfully to your email, please check your email inbox or spam folder',
            data: {
                email: user.email,
                otp: otp
            }
        })
    } else {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'Invalid user data',
            data: {}
        })
    }
})

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    const user = await User.findOne({ otp });
    if (!user) {
        res.status(404);
        throw new Error('OTP not found');
    }

    console.log('OTP from database:', user.otp);
    console.log('OTP from request:', otp);

    if (!user.otpCreatedAt) {
        res.status(500);
        throw new Error('OTP creation time not found');
    }

    console.log('OTP creation time:', user.otpCreatedAt);
    console.log('Time difference:', Date.now() - new Date(user.otpCreatedAt).getTime());

    const otpIsValid = user.otp === otp;
    const otpHasExpired = Date.now() - new Date(user.otpCreatedAt).getTime() > 5 * 60 * 1000; // 5 minutes

    console.log('OTP is valid:', otpIsValid);
    console.log('OTP has expired:', otpHasExpired);

    if (otpIsValid && !otpHasExpired) {
        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ id: user._id, otp }, process.env.JWT_SECRET);

        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: 'OTP verified',
            data: {
                token: token,
                otpCreatedAt: user.otpCreatedAt
            }
        });
    } else {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'Invalid or expired OTP',
            data: {}
        });
    }
});

// const authUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body
//     const user = await User.findOne({ email: email })

//     if (!user) {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'User not found',
//             data: {}
//         })
//     }

//     if (!user.isVerified) {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'Please verify your OTP first',
//             data: {}
//         })
//     }

//     if (await user.matchPassword(password)) {
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             isAdmin: user.isAdmin,
//             addresses: user.addresses,
//             token: generateToken(user._id)
//         })
//     } else {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'Invalid email or password',
//             data: {}
//         })
//     }
// })

// const authUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body
//     const token = req.headers.authorization.split(' ')[1];

//     if (!token) {
//         res.status(400).json({
//             code: "400",
//             status: "Bad Request",
//             success: false,
//             message: 'No authorization token provided',
//             data: {}
//         })
//         return;
//     }

//     let decodedToken;
//     try {
//         decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//         res.status(400).json({
//             code: "400",
//             status: "Bad Request",
//             success: false,
//             message: 'Invalid authorization token',
//             data: {}
//         })
//         return;
//     }

//     const user = await User.findOne({ _id: decodedToken.id, email: email })

//     if (!user) {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'User not found',
//             data: {}
//         })
//         return;
//     }

//     if (!user.isVerified) {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'Please verify your OTP first',
//             data: {}
//         })
//         return;
//     }

//     if (await user.matchPassword(password)) {
//         res.json({
//             code: "200",
//             status: "OK",
//             success: true,
//             message: 'Login successfully',
//             data: {
//                 user: {
//                     _id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     image: user.image,
//                     isAdmin: user.isAdmin,
//                     addresses: user.addresses,
//                     token: token
//                 }
//             }
//         })
//     } else {
//         res.status(401).json({
//             code: "401",
//             status: "Unauthorized",
//             success: false,
//             message: 'Invalid email or password',
//             data: {}
//         })
//     }
// })

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        res.status(401).json({
            code: "401",
            status: "Unauthorized",
            success: false,
            message: 'User not found',
            data: {}
        })
        return;
    }

    if (!user.isVerified) {
        res.status(401).json({
            code: "401",
            status: "Unauthorized",
            success: false,
            message: 'Please verify your OTP first',
            data: {}
        })
        return;
    }

    if (await user.matchPassword(password)) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            code: "200",
            status: "OK",
            success: true,
            message: 'Login successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    isAdmin: user.isAdmin,
                    addresses: user.addresses,
                    token: token
                }
            }
        })
    } else {
        res.status(401).json({
            code: "401",
            status: "Unauthorized",
            success: false,
            message: 'Invalid email or password',
            data: {}
        })
    }
})

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                addresses: user.addresses,
                isAdmin: user.isAdmin,
                isVerified: user.isVerified,
                cart: user.cart,
                wishlist: user.wishlist,
            }
        });
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: 'User not found',
            data: {}
        });
    }
});

const updateUserProfile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({
                code: "404",
                status: "Not Found",
                success: false,
                message: 'User not found',
                data: {}
            });
        }

        if (req.file == null) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.addresses = req.body.addresses || user.addresses;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.status(200).json({
                code: "200",
                status: "OK",
                success: true,
                message: 'Update successfully',
                data: {}
            });
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
                        code: "400",
                        status: "Bad Request",
                        success: false,
                        message: 'Upload failed',
                        data: {
                            error: err
                        }
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
                res.status(200).json({
                    code: "200",
                    status: "OK",
                    success: true,
                    message: 'Update successfully',
                    data: {
                        user: updatedUser
                    }
                });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: "500",
            status: "Internal Server Error",
            success: false,
            message: 'Internal Server Error',
            data: {}
        });
    }
};

// const getProfile = async (req, res) => {
//     const user = await User.findById(req.user._id).select('-password');

//     if (user) {
//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             addresses: user.addresses,
//             isAdmin: user.isAdmin,
//             isVerified: user.isVerified,
//             cart: user.cart,
//             wishlist: user.wishlist,
//         });
//     } else {
//         res.status(404);
//         throw new Error('User not found');
//     }
// };

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'No authorization token provided',
            data: {}
        })
        return;
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'Invalid authorization token',
            data: {}
        })
        return;
    }

    const user = await User.findOne({ _id: decodedToken.id, email: email })

    if (!user) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'User not found',
            data: {}
        })
        return;
    }

    if (!user.isVerified) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'Please verify your OTP first',
            data: {}
        })
        return;
    }

    user.name = name
    user.password = password

    await user.save()

    res.status(201).json({
        code: "201",
        status: "Created",
        success: true,
        message: 'User created successfully',
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                token: generateToken(user._id)
            }
        }
    })
})

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: 'User not found',
            data: {}
        });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        code: "200",
        status: "OK",
        success: true,
        message: 'Password reset successful',
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
            }
        }
    });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: 'User not found',
            data: {}
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6);

    user.otp = otp;
    user.otpCreatedAt = Date.now();
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP for forgot password request',
        html: `
        <div style="text-align: center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/768px-LEGO_logo.svg.png" alt="MetaShop Logo" style="width: 200px;"/>
        </div>
        <br>
        Hi ${user.name},<br><br>
        Your OTP is <b>${otp}</b><br><br>
        The OTP is valid for 5 minutes. <br><br>
        If you did not request this, please ignore this email. <br><br>
        Thanks,<br><br>
        MetaShop Team
    `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Please check your email for the OTP to change your password',
        data: {
            email: user.email,
            otp: otp
        }
    });
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({ otp });
    if (!user) {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: 'Invalid or OTP has expired (OTP not found)',
            data: {}
        });
    }

    const otpHasExpired = Date.now() - new Date(user.otpCreatedAt).getTime() > 5 * 60 * 1000;
    if (otpHasExpired) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'OTP has expired',
            data: {}
        });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Password reset successful',
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                addresses: user.addresses
            }
        }
    });
});

// const addToCart = asyncHandler(async (req, res) => {
//     const { productId, quantity } = req.body;
//     const user = await User.findById(req.user._id);
//     const product = await Product.findById(productId);

//     const item = {
//         product: productId,
//         quantity,
//         price: product.price
//     };

//     user.cart.push(item);
//     await user.save();

//     res.status(200).json({
//         code: "200",
//         status: "Success",
//         success: true,
//         message: 'Item successfully added to cart',
//         data: {
//             cart: user.cart
//         }
//     });
// });

const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (user) {
        res.json({
            code: "200",
            status: "Success",
            success: true,
            message: 'Cart retrieved successfully',
            data: {
                cart: user.cart
            }
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, variant, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);

    // Cari variant yang diminta
    const productVariant = product.variants.find(v =>
        v.color === variant.color && v.size === variant.size
    );

    // Jika variant tidak ditemukan atau stok tidak cukup, kirim error
    if (!productVariant || productVariant.quantity < quantity) {
        res.status(400).json({
            code: "400",
            status: "Error",
            success: false,
            message: 'Variant not found or not enough stock',
        });
        return;
    }

    const item = {
        product: productId,
        variant,
        quantity,
        price: product.price
    };

    user.cart.push(item);
    await user.save();

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Item successfully added to cart',
        data: {
            cart: user.cart
        }
    });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Item successfully removed from cart',
        data: {
            cart: user.cart
        }
    });
});

const getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: 'Wishlist retrieved successfully',
            data: {
                wishlist: user.wishlist
            }
        });
    } else {
        res.status(404).json({
            code: "404",
            status: "Not Found",
            success: false,
            message: 'User not found',
            data: {}
        });
    }
};

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    const item = {
        product: productId
    };

    user.wishlist.push(item);
    await user.save();

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Item successfully added to wishlist',
        data: {
            wishlist: user.wishlist
        }
    });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({
        code: "200",
        status: "Success",
        success: true,
        message: 'Item successfully removed from wishlist',
        data: {
            wishlist: user.wishlist
        }
    });
});

const checkEmailUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
        res.status(400).json({
            code: "400",
            status: "Bad Request",
            success: false,
            message: 'This email is already registered, please use other email address',
            data: {}
        });
    } else {
        res.status(200).json({
            code: "200",
            status: "OK",
            success: true,
            message: 'This email is available to use for registration',
            data: {}
        });
    }
});


module.exports = { sendOtp, verifyOtp, authUser, getUserProfile, registerUser, updateUserProfile, resetPassword, forgotPassword, resetPasswordWithOtp, getCart, addToCart, removeFromCart, getWishlist, addToWishlist, removeFromWishlist, checkEmailUser }