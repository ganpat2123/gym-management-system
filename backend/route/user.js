
const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const {
  isLogin,
  isAdmin
} = require("../middleware/middleware.js");

const controller = require("../controller/user.js");
const db = require("../config/db.js");

// Database query helper
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// REGISTER
router.post("/register", controller.register);

// LOGIN
router.post("/login", controller.login);

// LOGOUT
router.post("/logout", isLogin, controller.logout);

// GET CURRENT USER
router.get("/me", isLogin, async (req, res) => {
  try {
    const users = await query(
      `SELECT id, name, email, phone, role,
              is_active, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      data: users[0]
    });
  } catch (error) {
    console.error("Profile fetch error:", error.code);

    return res.status(500).json({
      status: false,
      message: "Unable to fetch profile"
    });
  }
});

// UPDATE OWN PROFILE
router.patch("/me", isLogin, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        status: false,
        message: "Valid name, email and phone are required"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (
      !cleanName ||
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !/^\d{10}$/.test(cleanPhone)
    ) {
      return res.status(400).json({
        status: false,
        message: "Please enter valid profile information"
      });
    }

    const result = await query(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const users = await query(
      `SELECT id, name, email, phone, role,
              is_active, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: users[0]
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: false,
        message: "Email is already registered"
      });
    }

    console.error("Profile update error:", error.code);

    return res.status(500).json({
      status: false,
      message: "Unable to update profile"
    });
  }
});

// CHANGE OWN PASSWORD
router.put("/me/password", isLogin, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      newPassword.length < 8 ||
      newPassword.length > 72
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Enter current password and a new password of 8 to 72 characters"
      });
    }

    const users = await query(
      "SELECT id, password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const user = users[0];

    const isCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCorrect) {
      return res.status(400).json({
        status: false,
        message: "Current password is incorrect"
      });
    }

    const isSame = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSame) {
      return res.status(400).json({
        status: false,
        message:
          "New password must be different from current password"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    const result = await query(
      `UPDATE users
       SET password = ?
       WHERE id = ? AND password = ?`,
      [
        hashedPassword,
        req.user.id,
        user.password
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        status: false,
        message:
          "Password changed in another session. Please try again"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Password change error:", error.code);

    return res.status(500).json({
      status: false,
      message: "Unable to change password"
    });
  }
});

// GET ALL USERS - ADMIN ONLY
router.get("/", isLogin, isAdmin, controller.AllUser);

// ACTIVATE / DEACTIVATE USER - ADMIN ONLY
router.patch("/:id/status", isLogin, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID"
      });
    }

    if (is_active !== 0 && is_active !== 1) {
      return res.status(400).json({
        status: false,
        message: "Status must be 0 or 1"
      });
    }

    if (String(req.user.id) === String(id)) {
      return res.status(403).json({
        status: false,
        message: "You cannot change your own account status"
      });
    }

    const result = await query(
      `UPDATE users
       SET is_active = ?
       WHERE id = ? AND role = 'user'`,
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Member not found or cannot change admin status"
      });
    }

    return res.status(200).json({
      status: true,
      message:
        is_active === 1
          ? "User activated successfully"
          : "User deactivated successfully"
    });
  } catch (error) {
    console.error("Status update error:", error.code);

    return res.status(500).json({
      status: false,
      message: "Unable to update user status"
    });
  }
});

// GET INDIVIDUAL USER
router.get("/:id", isLogin, controller.one);

// UPDATE USER - ADMIN ONLY
router.put("/:id", isLogin, isAdmin, controller.update);

// DELETE USER - ADMIN ONLY
router.delete("/:id", isLogin, isAdmin, controller.delete);

module.exports = router;
