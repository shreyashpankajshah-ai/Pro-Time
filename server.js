// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON payloads

// API Routes
app.use('/api/v1/tasks', taskRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: '🟢 System Nominal', timestamp: new Date() });
});

// Initialize Server
app.listen(PORT, () => {
    console.log(`🚀 ProTime Server initialized on port ${PORT}`);
});