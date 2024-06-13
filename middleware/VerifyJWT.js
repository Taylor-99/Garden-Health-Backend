
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db  = require('../models');


const verifyToken = async (req, res, next) => {

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access Denied' });
        }

        const decoded = jwt.verify(token, process.env.SECRET);

        const user = await db.User.findById(decoded.userID);

        if (!user) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        req.user = user; // Attach user object to request for later use

        // Check if token is close to expiry (e.g., within 5 minutes)
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decoded.exp - currentTimestamp < 300) {
            // If token is close to expiry, issue a new token
            const newToken = jwt.sign({ userID: decoded.userID }, process.env.SECRET, { expiresIn: '1h' }); // Example expiry of 1 hour
            res.cookie('token', newToken, { httpOnly: true, secure: true }); // Set new token in cookie
        }

        next(); // Continue to the next middleware or route handler
    } catch (err) {
        res.status(400).json({ message: 'Token verification failed:' });
    }
};

module.exports = verifyToken