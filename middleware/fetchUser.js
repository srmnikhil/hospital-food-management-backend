const jwt = require("jsonwebtoken");
const JWT_SECRET = "srmnikku";

const fetchUser = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};

module.exports = fetchUser;
