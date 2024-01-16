// socket.js
const socketIO = require('socket.io');
const Chat = require('./models/chatModel');
const User = require('./models/userModel');
const Notification = require('./models/notificationsModel');
const process = require('process');
require('dotenv').config();
const jwt = require('jsonwebtoken');

let io;
let productNotifications = new Map();
let connectedUsers = new Map();


const configureSocket = (server) => {
    io = socketIO(server);

    io.on('connection', (socket) => {
        console.log(`User connected`);

        // Log all events received
        socket.onAny((event, ...args) => {
            console.log(`Received event: ${event}`, args);
        });

        // Update the 'join' event to use the JWT token
        socket.on('join', async (token) => {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

                // Extract user information from the decoded token
                const { id, email, userType } = decodedToken;

                const user = await User.findById(id);

                if (!user) {
                    throw new Error(`User with id: ${id} not found`);
                }

                socket.user = user;
                connectedUsers.set(socket.id, socket.user);

                // Join a room with the user's email as the room name
                socket.join(user.email);

                console.log(`${socket.user.firstName} joined the chat`);

                // Convert user._id to a string for comparison
                const userIdString = user._id.toString();

                // console.log('productNotifications:', productNotifications);
                // console.log('userIdString:', userIdString);

                // Send stored product notifications to the user upon login
                const userNotifications = productNotifications.get(userIdString);
                                // console.log('userNotifications:', userNotifications);


                // Save notifications in the database
                if (userNotifications) {
                    for (const notification of userNotifications) {
                        socket.emit('productCreated', notification);

                        // Save notification to the Notification model
                        const newNotification = new Notification({
                            userId: user._id,
                            product: notification.product._id, // You need to define the product structure in your model
                        });
                        await newNotification.save();

                        console.log('Notifi`cation sent and saved to the database:', notification);
                    }
                    // Clear notifications after sending
                    productNotifications.delete(userIdString);
                }
            } catch (error) {
                console.error('Error joining the chat:', error);
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
                if (socket.user) {
                    console.log(`${socket.user.firstName} disconnected`);
                } else {
                    console.log(`User disconnected`);
                }
                connectedUsers.delete(socket.id);
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitProductNotificationToConnectedUsers = (notification) => {
    for (const [socketId, user] of connectedUsers) {
        io.to(socketId).emit('productCreated', notification);
    }
};

module.exports = { configureSocket, getIo, emitProductNotificationToConnectedUsers, productNotifications, connectedUsers };
