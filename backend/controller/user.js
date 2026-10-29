
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
module.exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: false,
        message: "Name, email, password and phone are required"
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email address"
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
            password,
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
                return res.status(
                  insertError.code === "ER_DUP_ENTRY"
                    ? 409
                    : 500
                ).json({
                  status: false,
                  message:
                    insertError.code === "ER_DUP_ENTRY"
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
        } catch (hashError) {
          return res.status(500).json({
            status: false,
            message: "Unable to register user"
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server side error"
    });
  }
};

 // LOGIN
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required"
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [String(email).trim().toLowerCase()],
      async (err, results) => {
        if (err) {
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

          // Step 1: Verify password
          const passwordMatches = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordMatches) {
            return res.status(401).json({
              status: false,
              message: "Invalid email or password"
            });
          }

          // Step 2: Check whether account is active
          if (Number(user.is_active) !== 1) {
            return res.status(403).json({
              status: false,
              message:
                "Your account is deactivated. Please contact the gym administrator."
            });
          }

          // Step 3: Generate JWT token
          const token = jwt.sign(
            {
              id: user.id,
              role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          // Step 4: Set secure authentication cookie
          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
          });

          return res.status(200).json({
            status: true,
            message: "Login successfully"
          });

        } catch (loginError) {
          console.error("Login error:", loginError);

          return res.status(500).json({
            status: false,
            message: "Unable to login"
          });
        }
      }
    );

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: false,
      message: "Server side error"
    });
  }
};


// LOGOUT
module.exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return res.status(200).json({
    status: true,
    message: "Logout successful"
  });
};

// GET ALL USERS - ADMIN ONLY
module.exports.AllUser = (req, res) => {
 const sql = `
  SELECT id, name, email, phone, role, is_active, created_at
  FROM users
  ORDER BY id DESC
`;

  db.query(sql, (err, results) => {
    if (err) {
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

// GET ONE USER
module.exports.one = (req, res) => {
  const { id } = req.params;

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

// UPDATE USER - ADMIN ONLY
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;

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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      !/^\d{10}$/.test(cleanPhone) ||
      String(password).length < 8
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid user information"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
          return res.status(
            err.code === "ER_DUP_ENTRY" ? 409 : 500
          ).json({
            status: false,
            message:
              err.code === "ER_DUP_ENTRY"
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
    return res.status(500).json({
      status: false,
      message: "Unable to update user"
    });
  }
};

// DELETE USER - ADMIN ONLY
module.exports.delete = (req, res) => {
  const { id } = req.params;

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
