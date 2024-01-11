const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

const connections = {};

wss.on('connection', (ws, req) => {
    const userId = req.user._id.toString(); // Assuming you have user information in req.user

    if (!connections[userId]) {
        connections[userId] = ws;
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const targetUserId = data.targetUserId;

        if (connections[targetUserId]) {
            connections[targetUserId].send(JSON.stringify({
                type: 'chat',
                message: data.message,
                sender: userId,
            }));
        }
    });

    ws.on('close', () => {
        if (connections[userId] === ws) {
            delete connections[userId];
        }
    });
});

const attach = (server) => {
    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });
};

module.exports = {
    attach,
};
