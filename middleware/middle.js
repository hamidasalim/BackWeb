const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Read the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token (Bearer <token>)

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY); // Verify the token
        req.user = verified; // Attach the decoded token payload to the request
        next(); // Proceed to the next middleware or controller
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = { authenticateToken };
