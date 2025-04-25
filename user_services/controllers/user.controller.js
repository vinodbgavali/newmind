const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created successfully', data: { id: user.id, name, email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'strict',
        maxAge: 3600000, 
      });


    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const blacklist = JSON.parse(process.env.TOKEN_BLACKLIST || '[]');
    blacklist.push(token);
    process.env.TOKEN_BLACKLIST = JSON.stringify(blacklist);
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: false,        // match exactly with how it was set
      sameSite: 'strict'
  });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate token (internal endpoint for other services)
exports.validateToken = async (req, res) => {
  try {
    // const token = req.header('Authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return res.status(401).json({ message: 'No token provided' });
    // }
    // console.log(req.cookies?.authToken );
    const token = req.cookies?.authToken;

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