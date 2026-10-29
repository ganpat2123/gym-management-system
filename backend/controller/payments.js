
const db = require("../config/db");

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const isValidId = (value) => {
  return /^[1-9]\d*$/.test(String(value ?? ""));
};

const isValidDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validatePayment = (body) => {
  const {
    user_id,
    membership_id,
    amount,
    payment_date,
    status
  } = body;

  if (!isValidId(user_id)) {
    return "Please select a valid user";
  }

  if (!isValidId(membership_id)) {
    return "Please select a valid membership";
  }

  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "Amount is required";
  }

  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount > 99999999.99 ||
    !/^\d+(\.\d{1,2})?$/.test(String(amount))
  ) {
    return "Enter a valid amount with maximum 2 decimal places";
  }

  if (!isValidDate(payment_date)) {
    return "Enter a valid payment date in YYYY-MM-DD format";
  }

  if (
    typeof status !== "string" ||
    !["pending", "paid", "failed"].includes(status.toLowerCase())
  ) {
    return "Payment status must be pending, paid or failed";
  }

  return null;
};

const checkMembershipOwner = async (userId, membershipId) => {
  const rows = await query(
    `
      SELECT id, user_id
      FROM memberships
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [membershipId, userId]
  );

  return rows.length > 0;
};

const sendDatabaseError = (res, err) => {
  console.error(
    "Payments database error:",
    err.code || err.message
  );

  return res.status(500).json({
    status: false,
    message: "Unable to process payment request"
  });
};

// CREATE PAYMENT - ADMIN ONLY
module.exports.new = async (req, res) => {
  try {
    const {
      user_id,
      membership_id,
      amount,
      payment_date,
      status
    } = req.body;

    const validationError = validatePayment(req.body);

    if (validationError) {
      return res.status(400).json({
        status: false,
        message: validationError
      });
    }

    const validMembership = await checkMembershipOwner(
      user_id,
      membership_id
    );

    if (!validMembership) {
      return res.status(400).json({
        status: false,
        message: "Membership does not belong to the selected user"
      });
    }

    const result = await query(
      `
        INSERT INTO payments
        (user_id, membership_id, amount, payment_date, status)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        user_id,
        membership_id,
        Number(amount),
        payment_date,
        status.toLowerCase()
      ]
    );

    return res.status(201).json({
      status: true,
      message: "Payment created successfully",
      data: {
        id: result.insertId
      }
    });
  } catch (err) {
    return sendDatabaseError(res, err);
  }
};

// GET ALL PAYMENTS - ADMIN ONLY
module.exports.allPayme = async (req, res) => {
  try {
    const results = await query(
      `
        SELECT *
        FROM payments
        ORDER BY payment_date DESC, id DESC
      `
    );

    return res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data: results
    });
  } catch (err) {
    return sendDatabaseError(res, err);
  }
};

// GET SINGLE PAYMENT
module.exports.one = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid payment ID"
      });
    }

    const results = await query(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Payment not found"
      });
    }

    const payment = results[0];

    const isOwner =
      String(payment.user_id) === String(req.user.id);

    const isAdministrator = req.user.role === "admin";

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
  } catch (err) {
    return sendDatabaseError(res, err);
  }
};

// UPDATE PAYMENT - ADMIN ONLY
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid payment ID"
      });
    }

    const validationError = validatePayment(req.body);

    if (validationError) {
      return res.status(400).json({
        status: false,
        message: validationError
      });
    }

    const {
      user_id,
      membership_id,
      amount,
      payment_date,
      status
    } = req.body;

    const existing = await query(
      "SELECT id FROM payments WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Payment not found"
      });
    }

    const validMembership = await checkMembershipOwner(
      user_id,
      membership_id
    );

    if (!validMembership) {
      return res.status(400).json({
        status: false,
        message: "Membership does not belong to the selected user"
      });
    }

    await query(
      `
        UPDATE payments
        SET
          user_id = ?,
          membership_id = ?,
          amount = ?,
          payment_date = ?,
          status = ?
        WHERE id = ?
      `,
      [
        user_id,
        membership_id,
        Number(amount),
        payment_date,
        status.toLowerCase(),
        id
      ]
    );

    return res.status(200).json({
      status: true,
      message: "Payment updated successfully"
    });
  } catch (err) {
    return sendDatabaseError(res, err);
  }
};

// DELETE PAYMENT - ADMIN ONLY
// Paid payments cannot be deleted.
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid payment ID"
      });
    }

    // Atomic delete: Paid payments remain protected
    // even when multiple requests occur.
    const result = await query(
      `
        DELETE FROM payments
        WHERE id = ?
          AND LOWER(status) IN ('pending', 'failed')
      `,
      [id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        status: true,
        message: "Payment deleted successfully"
      });
    }

    const existing = await query(
      "SELECT id FROM payments WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Payment not found"
      });
    }

    return res.status(403).json({
      status: false,
      message: "Only pending or failed payments can be deleted"
    });
  } catch (err) {
    return sendDatabaseError(res, err);
  }
};
