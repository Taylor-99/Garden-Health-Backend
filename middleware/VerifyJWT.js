
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db  = require('../models');


const verifyToken = async (req, res, next) => {

    try {
        // const token = req.cookies.token;
        // let token = req.headers.authorization
        // let extractedToken = token.slice(7);

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        console.log('Verify token = ', token)

        if (!token) {
            return res.status(401).json({ message: 'Access Denied' });
        } else{
            const decoded = jwt.verify(token, process.env.SECRET);

            const user = await db.User.findById(decoded.userID);
    
            if (!user) {
                return res.status(401).json({ message: 'Invalid Token' });
            } else{
                req.user = user; // Attach user object to request for later use
        
                next(); // Continue to the next middleware or route handler
            }
    

        }

    } catch (err) {
        res.status(400).json({ message: 'Token verification failed:' });
    }
};

module.exports = verifyToken