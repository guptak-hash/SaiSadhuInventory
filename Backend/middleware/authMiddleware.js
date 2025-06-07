const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
require('dotenv').config()

const authMiddleware = (...role) => {
    return async (req, res, next) => {
        try {
            // Check if authorization header exists
            if (!req.headers.authorization) {
                return res.status(401).json({ msg: 'Authorization header missing' });
            };

            // Extract token
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ msg: 'Token not provided' });
            };

            // decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // console.log(`decoded>> `, decoded)
            // attach user object to req 
            // req.userId = decoded.userId;

            // Check role authorization
            if (role.includes(decoded.role)) {
                // attach user object to req 
                req.user = decoded;
                next();
            } else {
                return res.status(403).json({ msg: 'User not authorized for this operation' });
            }
        } catch (err) {
            console.log(err.message);

            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ msg: 'Invalid token' });
            } else {
                return res.status(500).json({ msg: 'Something went wrong. Please login again' });
            }
        }
    };
};

module.exports = authMiddleware