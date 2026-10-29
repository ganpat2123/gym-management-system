
const express = require("express");
const router = express.Router();

const {
    isLogin,
    isAdmin
} = require("../middleware/middleware.js");

const controller = require("../controller/payments.js");
const db = require("../config/db.js");

// Create payment - Admin only
// Normal users cannot create fake payment records.
router.post("/", isLogin, isAdmin, controller.new);

// Get all payments - Admin only
router.get("/", isLogin, isAdmin, controller.allPayme);

// Get logged-in user's payments
router.get("/mine", isLogin, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            p.id,
            p.user_id,
            p.membership_id,
            p.amount,
            p.payment_date,
            p.status
        FROM payments AS p
        WHERE p.user_id = ?
        ORDER BY p.payment_date DESC, p.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(
                "Unable to fetch user payments:",
                err.code
            );

            return res.status(500).json({
                status: false,
                message: "Unable to fetch payment history"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Payment history fetched successfully",
            data: results
        });
    });
});

// Get individual payment
router.get("/:id", isLogin, (req, res) => {
    const paymentId = req.params.id;

    if (!/^[1-9]\d*$/.test(paymentId)) {
        return res.status(400).json({
            status: false,
            message: "Invalid payment ID"
        });
    }

    const sql = `
        SELECT *
        FROM payments
        WHERE id = ?
    `;

    db.query(sql, [paymentId], (err, results) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Unable to fetch payment"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Payment not found"
            });
        }

        const payment = results[0];

        const isOwner =
            String(payment.user_id) ===
            String(req.user.id);

        const isAdministrator =
            req.user.role === "admin";

        if (!isAdministrator && !isOwner) {
            return res.status(403).json({
                status: false,
                message: "Access denied"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Payment fetched successfully",
            data: payment
        });
    });
});

// Update payment - Admin only
router.put(
    "/:id",
    isLogin,
    isAdmin,
    controller.update
);

// Delete payment - Admin only
router.delete(
    "/:id",
    isLogin,
    isAdmin,
    controller.delete
);

module.exports = router;
