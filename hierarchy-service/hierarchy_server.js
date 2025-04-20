require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.config');
const hierarchyRoutes = require('./routes/hierarchy.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', hierarchyRoutes);

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Hierarchy Service running on port ${PORT}`);
});