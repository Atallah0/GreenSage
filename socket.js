// socket.js
const socketIO = require('socket.io');
const Chat = require('./models/chatModel');
const User = require('./models/userModel');
const process = require('process');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const configureSocket = (server) => {
    const io = socketIO(server);
    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        // Update the 'join' event to use the JWT token
        socket.on('join', async (token) => {
            try {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

                // Extract user information from the decoded token
                const { id, email, userType } = decodedToken;

                const user = await User.findById(id);
                // console.log(user);

                if (!user) {
                    throw new Error(`User with id: ${id} not found`);
                }

                socket.user = user;
                connectedUsers.set(socket.id, socket.user);

                // Join a room with the user's email as the room name
                socket.join(user.email);

                console.log(`${socket.user.firstName} joined the chat`);
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
                connectedUsers.delete(socket.id);
                console.log(`${socket.user.firstName} disconnected`);
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
};

module.exports = configureSocket;
