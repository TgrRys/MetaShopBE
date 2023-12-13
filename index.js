const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors') // import cors
const connectDB = require('./config/dbconfig.js')
const productRoutes = require('./routes/productRoutes.js')
const userRoutes = require('./routes/userRoutes.js')
const orderRoutes = require('./routes/orderRoutes.js')
const paymentRoutes = require('./routes/paymentRoutes.js')
const adminRoutes = require('./routes/adminRoutes.js')
const { errorHandler } = require('./middleware/errorMiddleWare.js')

// CONFIG APP AND DB
dotenv.config()
connectDB()
const app = express()
app.use(cors()) // use cors middleware
app.use(express.json());
const PORT = 5000

// ROUTES HERE
app.use('/products', productRoutes)
app.use('/user', userRoutes)
app.use('/order', orderRoutes)
app.use('/payment', paymentRoutes)
app.use('/admin', adminRoutes)

app.get('/', (req, res) => {
    return res.send('API IS RUNNING')
})

app.use(errorHandler)

app.listen(PORT, console.log(`SERVER IS RUNNING ON PORT ${PORT}`))


// {
//     "name": "Kemeja Hitam Polos Lengan Pendek | Baju Cowok Slimfit",
//     "subtitle": "Kemeja Polos Pendek Pria",
//   "description": "Kemeja Pendek Polos pria\nDetail size chart\nM : 50cm Lebar dada x 70cm Panjang\nL : 52cm Lebar dada x 72cm panjang\nXL : 54cm Lebar dada x 74cm panjang\nBahan : Katun Poplin\nUntuk lingkar dada di kali 2 dari lebar dada\n\nBAHAN : Katun poplin\nSIZE : M L XL\nselamat berbelanja di toko Sukamaju",

//     "variants": [
//         {
//             "color": "Hitam",
//             "size": "M",
//             "quantity": 10
//         },
//         {
//             "color": "Hitam",
//             "size": "L",
//             "quantity": 10
//         },
//         {
//             "color": "Hitam",
//             "size": "XL",
//             "quantity": 10
//         },
//         {
//             "color": "Putih",
//             "size": "M",
//             "quantity": 5
//         },
//         {
//             "color": "Putih",
//             "size": "L",
//             "quantity": 5
//         },
//         {
//             "color": "Putih",
//             "size": "XL",
//             "quantity": 5
//         },
//         {
//             "color": "Navy",
//             "size": "M",
//             "quantity": 15
//         },
//         {
//             "color": "Navy",
//             "size": "L",
//             "quantity": 15
//         },
//         {
//             "color": "Navy",
//             "size": "XL",
//             "quantity": 15
//         },
//         {
//             "color": "Maroon",
//             "size": "M",
//             "quantity": 20
//         },
//         {
//             "color": "Maroon",
//             "size": "L",
//             "quantity": 20
//         },
//         {
//             "color": "Maroon",
//             "size": "XL",
//             "quantity": 20
//         }
//     ],
//     "category": "Pria",
//     "price": "77.000",
//     "images": {
//         "main": "https://res.cloudinary.com/dnntarxri/image/upload/v1702352073/E%20COMMERCE/Pria/Kemeja%20Hitam%20Polos%20Lengan%20Pendek%20%20Baju%20Cowok%20Slimfit/Hitam_fbvs5s.jpg",
//         "sub": "https://res.cloudinary.com/dnntarxri/image/upload/v1702352075/E%20COMMERCE/Pria/Kemeja%20Hitam%20Polos%20Lengan%20Pendek%20%20Baju%20Cowok%20Slimfit/Putih_kuldsa.jpg"
//     },
//     "featured": false,
//     "imgSrc": ["https://res.cloudinary.com/dnntarxri/image/upload/v1702352075/E%20COMMERCE/Pria/Kemeja%20Hitam%20Polos%20Lengan%20Pendek%20%20Baju%20Cowok%20Slimfit/Navy_c8lyjw.jpg", "https://res.cloudinary.com/dnntarxri/image/upload/v1702352074/E%20COMMERCE/Pria/Kemeja%20Hitam%20Polos%20Lengan%20Pendek%20%20Baju%20Cowok%20Slimfit/Maroon_xyucwz.jpg"]
// }