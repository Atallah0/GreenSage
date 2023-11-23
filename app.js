const express = require('express')
const process = require('process')
const app = express()
const connectDB = require('./db/dbConnection')
require('dotenv').config()

// M
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

// Routers
const users = require('./routes/userRoutes')
const addresses = require('./routes/addressRoutes')

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes Middleware
app.use('/api/users', users)
app.use('/api/addresses', addresses)

// M
app.use(notFound);
app.use(errorHandler)

const PORT = parseInt(process.env.PORT) || 5000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}...`)
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