const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received:', token);

    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded', decoded)
        req.user = decoded;
        console.log('Decoded User:', decoded);
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

module.exports = auth;

