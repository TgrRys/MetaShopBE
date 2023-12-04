const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/dbconfig.js')
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
const PORT = 5000 

// ROUTES HERE
app.use('/products', productRoutes)
app.use('/user',userRoutes)
app.use('/order',orderRoutes)
app.use('/payment',paymentRoutes)
app.use('/admin', adminRoutes)

app.get('/', (req, res) => {
    return res.send('API IS RUNNING')
})

app.use(errorHandler)

app.listen(PORT, console.log(`SERVER IS RUNNING ON PORT ${PORT}`))