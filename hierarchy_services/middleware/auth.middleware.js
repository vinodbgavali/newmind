const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  // let token = req.cookies?.jwt;
     console.log('inside hirarchy middleware');
  const token = req.cookies?.authToken;
  console.log( {token});
  

  if (!token) {
    console.log('isnide not token' , token);
    
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const response = await axios.get(`http://localhost:3001/api/users/validate-token`, {
      headers: {
        Cookie: `authToken=${token}`
      }
    });
    req.user = response.data.userId;
 
    
    // console.log(response);
    
    req.token = token; // Store token for inter-service calls
    next();
  } catch (error) {
    res.status(401).json({ message: error.response?.data?.message || 'Token is not valid' });
  }
};

module.exports = authMiddleware;