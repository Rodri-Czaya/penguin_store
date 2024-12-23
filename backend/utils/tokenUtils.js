const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
    if (!token) {
        return null;
    }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const getTokenFromRequest = (req) => {
    return req.query.token || req.headers.authorization?.replace('Bearer ', '');
};

// Handler for API routes (returns JSON responses)
const authenticateApi = async (req, res, next) => {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = decoded;
    next();
};

// Handler for page routes (handles redirects)
const authenticatePage = async (req, res, next) => {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.redirect('/auth/login');
    }
    
    req.user = decoded;
    res.locals.token = token; // Make token available to templates
    next();
};

module.exports = {
    verifyToken,
    getTokenFromRequest,
    authenticateApi,
    authenticatePage
};