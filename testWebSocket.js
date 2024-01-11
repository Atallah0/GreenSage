const WebSocket = require('ws');

const userId1 = '6588c6658819d981bec539be'; // Replace with the actual user IDs you want to test
const userId2 = '6588c76d8819d981bec539c3';

const ws1 = new WebSocket('ws://localhost:5000');
const ws2 = new WebSocket('ws://localhost:5000');

// Event listener for connection open
ws1.on('open', () => {
  console.log('Connected to WebSocket as User 1');
  ws1.send(JSON.stringify({ targetUserId: userId2, message: 'Hello from User 1' }));
});

// Event listener for incoming messages
ws1.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`User 1 received a message from User ${message.sender}: ${message.message}`);
});

// Event listener for connection open
ws2.on('open', () => {
  console.log('Connected to WebSocket as User 2');
  ws2.send(JSON.stringify({ targetUserId: userId1, message: 'Hello from User 2' }));
});

// Event listener for incoming messages
ws2.on('message', (data) => {
  const message = JSON.parse(data);
  console.log(`User 2 received a message from User ${message.sender}: ${message.message}`);
});
