
const jwt = require("jsonwebtoken");
const db = require("../config/db.js");

// Check Login + Active Account
function isLogin(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Token not found"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (err) {
        return res.status(401).json({
            status: false,
            message: "Invalid or expired token"
        });
    }

    if (!decoded.id) {
        return res.status(401).json({
            status: false,
            message: "Invalid user session"
        });
    }

    const sql = `
        SELECT id, role, is_active
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [decoded.id], (err, results) => {
        if (err) {
            console.error(
                "Authentication database error:",
                err.code
            );

            return res.status(500).json({
                status: false,
                message: "Unable to verify account"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                status: false,
                message: "Account not found"
            });
        }

        const user = results[0];

        if (Number(user.is_active) !== 1) {
            return res.status(403).json({
                status: false,
                message:
                    "Your account is deactivated. Please contact the gym administrator."
            });
        }

        // Always use current database role,
        // not an outdated role stored in JWT.
        req.user = {
            id: user.id,
            role: user.role
        };

        next();
    });
}

// Admin Permission Check
function isAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            status: false,
            message: "Access denied. Admin only"
        });
    }

    next();
}

module.exports = {
    isLogin,
    isAdmin
};
