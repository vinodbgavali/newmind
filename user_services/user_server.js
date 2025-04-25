require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/dbconfig');
const userRoutes = require('./routes/user.routes');
const cors = require('cors');

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4000', // Allow frontend origin
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// Connect to MySQL
connectDB();


// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Users Service running on http://localhost:${PORT}`);
});