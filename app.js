const express = require('express');
const process = require('process');
const app = express();
const connectDB = require('./db/dbConnection');
require('dotenv').config();

// M
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const register = require('./utils/api/register');
const login = require('./utils/api/login');

// Routers
const users = require('./routes/userRoutes');
const addresses = require('./routes/addressRoutes');
const categories = require('./routes/categoryRoutes');
const products = require('./routes/productRoutes');
const ratings = require('./routes/ratingRoutes ');
const carts = require('./routes/cartRoutes');
const favorites = require('./routes/favoriteRoutes');
const shipments = require('./routes/shippingRoutes');
const payments = require('./routes/paymnetRoutes');
const orders = require('./routes/orderRoutes');

    
// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Routes Middleware
app.use(register);
app.use(login);
app.use('/api/users', users);
app.use('/api/addresses', addresses);
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/ratings', ratings);
app.use('/api/carts', carts);
app.use('/api/favorites', favorites);
app.use('/api/shipments', shipments);
app.use('/api/payments', payments);
app.use('/api/orders', orders);


// M
app.use(notFound);
app.use(errorHandler)

const PORT = parseInt(process.env.PORT) || 5000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}...`);
        })
    } catch (error) {
        console.log(error);
    }
}
start();







// const start = async () => {
//     try {
//       const MONGO_URL = process.env.NODE_ENV === 'development'
//         ? process.env.DEV_MONGO_URL
//         : process.env.PROD_MONGO_URL;
  
//       await connectDB(MONGO_URL);
//       app.listen(PORT, () => {
//         console.log(`Server is listening on port ${PORT}...`);
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };
// start();