const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http')

dotenv.config();
const app = express();

const server = http.createServer(app);
app.use(express.json());
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

// Handle WebSocket connections
// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     // Example events
//     socket.on('task-added', (data) => {
//         console.log('Task added:', data);
//         io.emit('task-added', data); // Broadcast to all connected clients
//     });

//     socket.on('task-updated', (data) => {
//         console.log('Task updated:', data);
//         io.emit('task-updated', data); // Broadcast updates
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected:', socket.id);
//     });
// });



app.use('/api/auth', require('./routes/auth'));
app.use('/api/task', require('./routes/users'));
app.use('/api/column', require('./routes/columnRoutes'))


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


