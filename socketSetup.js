const socketIO = require('socket.io');

const setupSocket = (server, app) => {
    const io = socketIO(server);

    // Map to store user sockets
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Assuming you have some authentication mechanism to get the userId
        const userId = socket.handshake.query.userId;

        // Store the socket for the user
        userSockets.set(userId, socket);

        socket.on('disconnect', () => {
            console.log('User disconnected');
            // Remove the socket when a user disconnects
            userSockets.delete(userId);
        });
    });

    // Make io accessible in other files
    app.set('io', io);

    return io;
};

module.exports = setupSocket;
