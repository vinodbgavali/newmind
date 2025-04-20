require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.config');
const userRoutes = require('./routes/user.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT_USERS || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});