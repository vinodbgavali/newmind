const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const response = await axios.get(`${process.env.USERS_SERVICE_URL}/api/users/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    req.user = response.data.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: error.response?.data?.message || 'Token is not valid' });
  }
};

module.exports = authMiddleware;