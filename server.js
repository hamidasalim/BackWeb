// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Use CORS to allow requests from the frontend
app.use(cors({ origin: 'http://localhost:5173' })); // Allow requests from frontend origin

// Middleware to parse JSON
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Define routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
