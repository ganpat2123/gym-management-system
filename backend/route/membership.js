
const express = require("express");
const router = express.Router();

const {
    isLogin,
    isAdmin
} = require("../middleware/middleware.js");

const controller = require("../controller/membership.js");
const db = require("../config/db.js");

// Create membership - Admin only
// Members cannot activate memberships themselves.
router.post(
    "/",
    isLogin,
    isAdmin,
    controller.new
);

// Get all memberships - Admin only
router.get(
    "/",
    isLogin,
    isAdmin,
    controller.allMem
);

// Get logged-in user's memberships
router.get("/mine", isLogin, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            m.id,
            m.user_id,
            m.plan_id,
            m.start_date,
            m.end_date,
            m.status,
            m.created_at,
            p.name AS plan_name,
            p.duration AS plan_duration,
            p.price AS plan_price,
            p.description AS plan_description
        FROM memberships m
        LEFT JOIN membership_plans p
            ON m.plan_id = p.id
        WHERE m.user_id = ?
        ORDER BY m.start_date DESC, m.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(
                "Membership fetch error:",
                err.code
            );

            return res.status(500).json({
                status: false,
                message: "Unable to fetch memberships"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Memberships fetched successfully",
            data: results
        });
    });
});

// Get one membership
router.get("/:id", isLogin, (req, res) => {
    const membershipId = req.params.id;

    if (!/^[1-9]\d*$/.test(membershipId)) {
        return res.status(400).json({
            status: false,
            message: "Invalid membership ID"
        });
    }

    const sql = `
        SELECT *
        FROM memberships
        WHERE id = ?
    `;

    db.query(sql, [membershipId], (err, results) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Unable to fetch membership"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Membership not found"
            });
        }

        const membership = results[0];

        const isAdminUser =
            req.user.role === "admin";

        const isOwner =
            String(membership.user_id) ===
            String(req.user.id);

        if (!isAdminUser && !isOwner) {
            return res.status(403).json({
                status: false,
                message: "Access denied"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Membership fetched successfully",
            data: membership
        });
    });
});

// Update membership - Admin only
router.put(
    "/:id",
    isLogin,
    isAdmin,
    controller.update
);

// Delete membership - Admin only
router.delete(
    "/:id",
    isLogin,
    isAdmin,
    controller.delete
);

module.exports = router;
