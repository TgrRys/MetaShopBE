const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('../src/config/dbconfig.js')
const productRoutes = require('./routes/productRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const orderRoutes = require('./routes/orderRoutes.js')
const paymentRoutes = require('./routes/paymentRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js')
const {errorHandler} = require('./middleware/errorMiddleWare.js')

// CONFIG APP AND DB
dotenv.config()
connectDB()
const app = express()
app.use(express.json())

// ROUTES HERE
app.use('/products', productRoutes)
app.use('/users',userRoutes)
app.use('/orders',orderRoutes)
app.use('/payment',paymentRoutes)
app.use('/admin', adminRoutes)

app.get('/', (req, res) => {
    res.send("Server is running")
})

app.use(errorHandler)

app.listen(process.env.PORT || 5000, console.log(`SERVER IS RUNNING ON PORT ${process.env.PORT}`))