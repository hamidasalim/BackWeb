const jwt = require('jsonwebtoken');

// Helper function to decode and verify the token
const decodeToken = (token) => {
  try {

    return jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to check the token and attach user info to req
module.exports = (req, res, next) => {

  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header


  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = decodeToken(token); // Use helper function to decode token
    req.user = decoded; // Attach decoded user info to req.user

    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
