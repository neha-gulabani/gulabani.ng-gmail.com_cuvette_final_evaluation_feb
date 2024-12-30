import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    transports: ['websocket'], // Ensure WebSocket transport
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Limit retries
    reconnectionDelay: 1000, // Delay between retries
});

socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.error('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

export default socket;
