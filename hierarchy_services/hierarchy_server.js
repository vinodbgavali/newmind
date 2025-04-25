require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/dbconfig');
const hierarchyRoutes = require('./routes/hierarchy.routes');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:4000', // Allow frontend origin
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use('/api/', hierarchyRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Hierarchy Service running on port ${PORT}`);
});