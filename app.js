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

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes Middleware
app.use('/api/users', users)

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
start()
