
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const logDbError = (operation, err) => {
  console.error(operation, {
    code: err.code,
    message: err.message
  });
};

// ==================== REGISTER ====================

module.exports.register = (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      status: false,
      message: "Name, email, password and phone are required"
    });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPhone = String(phone).trim();

  if (
    !cleanName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  ) {
    return res.status(400).json({
      status: false,
      message: "Invalid name or email address"
    });
  }

  if (!/^\d{10}$/.test(cleanPhone)) {
    return res.status(400).json({
      status: false,
      message: "Phone number must be 10 digits"
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      status: false,
      message: "Password must contain at least 8 characters"
    });
  }

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [cleanEmail],
    async (err, results) => {
      if (err) {
        logDbError("Registration SELECT error:", err);

        return res.status(500).json({
          status: false,
          message: "Server side error"
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          status: false,
          message: "Email already registered"
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(
          String(password),
          10
        );

        const sql = `
          INSERT INTO users
          (name, email, password, phone, role)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            cleanName,
            cleanEmail,
            hashedPassword,
            cleanPhone,
            "user"
          ],
          (insertError) => {
            if (insertError) {
              logDbError(
                "Registration INSERT error:",
                insertError
              );

              const duplicate =
                insertError.code === "ER_DUP_ENTRY";

              return res.status(
                duplicate ? 409 : 500
              ).json({
                status: false,
                message: duplicate
                  ? "Email already registered"
                  : "Unable to register user"
              });
            }

            return res.status(201).json({
              status: true,
              message: "User registered successfully"
            });
          }
        );
      } catch (error) {
        console.error(
          "Registration hashing error:",
          error.message
        );

        return res.status(500).json({
          status: false,
          message: "Unable to register user"
        });
      }
    }
  );
};

// ==================== LOGIN ====================

module.exports.login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Email and password are required"
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [cleanEmail],
    async (err, results) => {
      if (err) {
        logDbError("Login SELECT error:", err);

        return res.status(500).json({
          status: false,
          message: "Server side error"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password"
        });
      }

      try {
        const user = results[0];

        const passwordMatches = await bcrypt.compare(
          String(password),
          user.password
        );

        if (!passwordMatches) {
          return res.status(401).json({
            status: false,
            message: "Invalid email or password"
          });
        }

        if (Number(user.is_active) !== 1) {
          return res.status(403).json({
            status: false,
            message:
              "Your account is deactivated. Please contact the gym administrator."
          });
        }

        if (!process.env.JWT_SECRET) {
          console.error(
            "Login configuration error: JWT_SECRET is missing"
          );

          return res.status(500).json({
            status: false,
            message: "Login service is not configured"
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d"
          }
        );

        const isProduction =
          process.env.NODE_ENV === "production";

        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/",
          maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
          status: true,
          message: "Login successfully"
        });
      } catch (error) {
        console.error("Login processing error:", {
          code: error.code,
          message: error.message
        });

        return res.status(500).json({
          status: false,
          message: "Unable to login"
        });
      }
    }
  );
};

// ==================== LOGOUT ====================

module.exports.logout = (req, res) => {
  const isProduction =
    process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  });

  return res.status(200).json({
    status: true,
    message: "Logout successful"
  });
};

// ==================== GET ALL USERS ====================
// Admin authorization must be enforced by route middleware.

module.exports.AllUser = (req, res) => {
  const sql = `
    SELECT id, name, email, phone, role, is_active, created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      logDbError("Get users error:", err);

      return res.status(500).json({
        status: false,
        message: "Unable to fetch users"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: results
    });
  });
};

// ==================== GET ONE USER ====================

module.exports.one = (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized"
    });
  }

  if (
    req.user.role !== "admin" &&
    String(req.user.id) !== String(id)
  ) {
    return res.status(403).json({
      status: false,
      message: "Access denied"
    });
  }

  const sql = `
    SELECT id, name, email, phone, role, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      logDbError("Get one user error:", err);

      return res.status(500).json({
        status: false,
        message: "Unable to fetch user"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      status: true,
      message: "User fetched successfully",
      data: results[0]
    });
  });
};

// ==================== UPDATE USER ====================
// Admin authorization must be enforced by route middleware.

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: false,
        message: "All fields are required"
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (
      !cleanName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !/^\d{10}$/.test(cleanPhone) ||
      String(password).length < 8
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid user information"
      });
    }

    const hashedPassword = await bcrypt.hash(
      String(password),
      10
    );

    const sql = `
      UPDATE users
      SET name = ?, email = ?, password = ?, phone = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        cleanPhone,
        id
      ],
      (err, result) => {
        if (err) {
          logDbError("Update user error:", err);

          const duplicate =
            err.code === "ER_DUP_ENTRY";

          return res.status(
            duplicate ? 409 : 500
          ).json({
            status: false,
            message: duplicate
              ? "Email already registered"
              : "Unable to update user"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: false,
            message: "User not found"
          });
        }

        return res.status(200).json({
          status: true,
          message: "User updated successfully"
        });
      }
    );
  } catch (error) {
    console.error(
      "Update user error:",
      error.message
    );

    return res.status(500).json({
      status: false,
      message: "Unable to update user"
    });
  }
};

// ==================== DELETE USER ====================
// Admin authorization must be enforced by route middleware.

module.exports.delete = (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized"
    });
  }

  if (String(req.user.id) === String(id)) {
    return res.status(400).json({
      status: false,
      message: "You cannot delete your own admin account"
    });
  }

  db.query(
    "DELETE FROM users WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        logDbError("Delete user error:", err);

        return res.status(500).json({
          status: false,
          message:
            "Unable to delete user. Check linked records."
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        status: true,
        message: "User deleted successfully"
      });
    }
  );
};
