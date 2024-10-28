const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Safely handle undefined case
    console.log('Token received:', token); // Log token to verify it's being received

    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded', decoded)
        req.user = decoded; // Attach decoded token data to req.user
        console.log('Decoded User:', decoded); // Log decoded user
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

module.exports = auth;

