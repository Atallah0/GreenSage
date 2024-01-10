const io = require('socket.io-client');
const socket = io('http://localhost:5000'); // Replace with your server URL

socket.on('connect', () => {
    console.log('Connected to server');

    // // Simulate an order status update event
    // socket.emit('orderStatusUpdated', { orderId: 'YOUR_ORDER_ID' }); // Replace with a valid order ID
});

socket.on('orderStatusUpdated', (data) => {
    console.log('Received order status update:', data);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
