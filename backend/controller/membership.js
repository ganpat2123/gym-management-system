const db = require("../config/db");

module.exports.new = async (req, res) => {
    try {

        let { user_id, plan_id, start_date, end_date, status } = req.body;

        if (!user_id || !plan_id || !start_date || !end_date || !status) {
            return res.status(400).json({
                status: false,
                message: "user_id, plan_id, start_date, end_date, status  are required!"
            });
        }

        let sql = `INSERT INTO  memberships (user_id, plan_id, start_date, end_date, status) VALUES (?,?,?,?,?)`;

        db.query(sql, [user_id, plan_id, start_date, end_date, status], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(201).json({
                status: true,
                message: "New membership create successfully"
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.allMem = async (req, res) => {
    try {
        let sql = `SELECT * FROM memberships`;
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(200).json({
                status: true,
                message: "Show All membership successfully",
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
        let sql = `SELECT * FROM memberships WHERE id=?`;

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
                    message: "memberships not found"
                });
            }

            let membership = result[0];

            return res.status(200).json({
                status: true,
                message: "show individual memberships",
                data: membership
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.update = async (req, res) => {
    try {
        let { id } = req.params;
        let { user_id, plan_id, start_date, end_date, status } = req.body;

        if (!user_id || !plan_id || !start_date || !end_date || !status) {
            return res.status(400).json({
                status: false,
                message: "user_id, plan_id, start_date, end_date, status  are required!"
            });
        }

        let sql1 = `SELECT * FROM memberships WHERE id=?`;

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
                    message: "membership not found"
                });
            }

            let sql = `UPDATE memberships SET  user_id=?, plan_id=?, start_date=?, end_date=?, status=? WHERE id =?`;

            db.query(sql, [user_id, plan_id, start_date, end_date, status, id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "membership Update successfully"
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

module.exports.delete = async (req, res) => {
    try {

        let { id } = req.params;

        let sql1 = `SELECT * FROM memberships WHERE id=?`;

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
                    message: "memberships not found"
                });
            }


            let sql = `DELETE FROM memberships WHERE id=?`;

            db.query(sql, [id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "membership delete successfully"
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