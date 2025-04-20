const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password using bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with hashed password
        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ success: true, message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Logout user
exports.logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            tokenBlacklist.add(token);
        }
        // Instruct client to remove token
        res.json({ message: 'Logout successful, please remove the token on the client' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all users (protected route)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        res.json({ success: true, message: 'Users retrieved successfully', data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate token (internal endpoint for other services)
exports.validateToken = async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      const blacklist = JSON.parse(process.env.TOKEN_BLACKLIST || '[]');
      if (blacklist.includes(token)) {
        return res.status(401).json({ message: 'Token is invalid' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ userId: decoded.userId });
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };