const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('../src/config/dbconfig.js')
const productRoutes = require('./routes/productRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const orderRoutes = require('./routes/orderRoutes.js')
const paymentRoutes = require('./routes/paymentRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js')
let path = require('path')
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/../frontend/build')))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../','frontend', 'build', 'index.html'))
    })
} else {
    app.get('/api', (req, res) => {
        res.send("api")
    })
}
app.use(errorHandler)

app.listen(process.env.PORT || 5000, console.log(`SERVER IS RUNNING ON PORT ${process.env.PORT}`))

