const axios = require('axios');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1];
        console.log({ token });
        
        if (!token) {
            return res.redirect('/login');
        }

        // Make API call to external token verification service
        const response = await axios.post(
            'http://localhost:3001/api/users/validate-token', // Replace with your actual auth service URL
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 3000 // optional timeout for robustness
            }
        );

        // Attach userId or other user info to the request for downstream use
        req.user = { userId: response.data.userId };
        next();
    } catch (error) {
        console.error('Token verification failed:', error.response?.data || error.message);
        // res.redirect('/login');
    }
};

module.exports = verifyToken;
