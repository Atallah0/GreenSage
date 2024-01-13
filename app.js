const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./db/dbConnection');
const Chat = require('./models/chatModel');
const User = require('./models/userModel');
const process = require('process');
require('dotenv').config();
const cors = require('cors');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// M
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const register = require('./utils/api/register');
const login = require('./utils/api/login');

// Routers
const users = require('./routes/userRoutes');
const owners = require('./routes/ownerRoutes');
const addresses = require('./routes/addressRoutes');
const categories = require('./routes/categoryRoutes');
const products = require('./routes/productRoutes');
const ratings = require('./routes/ratingRoutes ');
const carts = require('./routes/cartRoutes');
const favorites = require('./routes/favoriteRoutes');
const shipments = require('./routes/shippingRoutes');
const payments = require('./routes/paymnetRoutes');
const orders = require('./routes/orderRoutes');


// CORS Middleware
app.use(cors());

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Routes Middleware
app.use(register);
app.use(login);
app.use('/api/users', users);
app.use('/api/owners', owners);
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
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}...`);
        })
    } catch (error) {
        console.log(error);
    }
}
start();


app.use(express.static('public'));


const connectedUsers = new Map();

io.on('connection', (socket) => {
    // app.js (within the io.on('connection', (socket) => { ... }) block)
    socket.on('join', async (userData) => {
        try {
            const { token, firstName, email } = userData;

            // Verify the token
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                throw new Error('Invalid token');
            }

            const user = await User.findOne({ email });
            if (!user) {
                throw new Error(`User with email ${email} not found`);
            }

            // User is authenticated, allow joining
            socket.user = user;
            connectedUsers.set(socket.id, socket.user);
            socket.join(user.email);

            console.log(`${socket.user.firstName} joined the chat`);
        } catch (error) {
            console.error('Error joining the chat:', error);
            socket.emit('error', 'Unauthorized to join chat');
        }
    });

    socket.on('chat message', async (msg) => {
        try {
            const newMessage = new Chat({
                user: socket.user._id,
                sender: socket.user.firstName,
                message: msg,
            });
            await newMessage.save();

            io.emit('chat message', {
                user: socket.user.firstName,
                message: msg,
            });

            console.log(`${socket.user.firstName} sent a message: ${msg}`);
        } catch (error) {
            console.error('Error saving and emitting message:', error);
        }
    });

    socket.on('private message', async (data) => {
        try {
            const { to, message } = data;
            const toUser = await User.findOne({ email: to });

            if (toUser) {
                const newMessage = new Chat({
                    user: socket.user._id,
                    to: to,
                    from: socket.user.firstName,
                    message: message,
                });
                await newMessage.save();

                // Emit private message to the sender
                io.to(socket.id).emit('private message', {
                    to: to,
                    from: socket.user.firstName,
                    message: message,
                });

                // Emit private message to the recipient's room
                io.to(toUser.email).emit('private message', {
                    to: to,
                    from: socket.user.firstName,
                    message: message,
                });

                console.log(`${socket.user.firstName} sent a private message to ${to}: ${message}`);
            } else {
                console.error(`User with email ${to} not found`);
            }
        } catch (error) {
            console.error('Error sending private message:', error);
        }
    });


    socket.on('disconnect', () => {
        try {
            connectedUsers.delete(socket.id);
            console.log(`${socket.user.firstName} disconnected`);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});
