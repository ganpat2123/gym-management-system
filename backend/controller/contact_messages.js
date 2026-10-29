const db = require("../config/db");

module.exports.new = async (req, res) => {
    try {

        let { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                status: false,
                message: "name, email, message are required!"
            });
        }

        let sql = `INSERT INTO contact_messages  (name,email,message) VALUES (?,?,?)`;

        db.query(sql, [name, email, message], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(201).json({
                status: true,
                message: "New contact message create successfully"
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.allCon = async (req, res) => {
    try {
        let sql = `SELECT * FROM contact_messages`;
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(200).json({
                status: true,
                message: "Show All contact messages successfully",
                data: result
            });
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.one = async (req, res) => {
    try {
        let { id } = req.params;
        let sql = `SELECT * FROM contact_messages WHERE id=?`;

        db.query(sql, [id], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "contact messages not found"
                });
            }

            let contact = result[0];

            return res.status(200).json({
                status: true,
                message: "show individual contact messages",
                data: contact
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.delete = async (req, res) => {
    try {

        let { id } = req.params;

        let sql1 = `SELECT * FROM contact_messages WHERE id=?`;

        db.query(sql1, [id], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    status: false,
                    message: "contact messages not found"
                });
            }


            let sql = `DELETE FROM contact_messages WHERE id=?`;

            db.query(sql, [id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "contact messages delete successfully"
                });
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

