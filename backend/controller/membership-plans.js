const db = require("../config/db");

module.exports.new = async (req, res) => {
    try {

        let { name, duration, price, description } = req.body;

        if (!name || !duration || !price || !description) {
            return res.status(400).json({
                status: false,
                message: "name, duration, price, description  are required!"
            });
        }

        let sql = `INSERT INTO  membership_plans (name,duration,price,description) VALUES (?,?,?,?)`;

        db.query(sql, [name, duration, price, description], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(201).json({
                status: true,
                message: "New membership plans create successfully"
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.allMemPl =  async (req, res) => {
    try {
        let sql = `SELECT * FROM membership_plans`;
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(200).json({
                status: true,
                message: "Show All membership plans successfully",
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
        let sql = `SELECT * FROM membership_plans WHERE id=?`;

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
                    message: "membership_plans not found"
                });
            }

            let membership_plans = result[0];

            return res.status(200).json({
                status: true,
                message: "show individual membership-plans",
                data: membership_plans
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
        let { name, duration, price, description } = req.body;

        if (!name || !duration || !price || !description) {
            return res.status(400).json({
                status: false,
                message: "name, duration, price, description  are required!"
            });
        }

        let sql1 = `SELECT * FROM membership_plans WHERE id=?`;

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
                    message: "membership-plans not found"
                });
            }

            let sql = `UPDATE membership_plans SET name=?,duration=?,price=?,description=? WHERE id =?`;

            db.query(sql, [name, duration, price, description, id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "membership plans Update successfully"
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

        let sql1 = `SELECT * FROM membership_plans WHERE id=?`;

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
                    message: "membership-plans not found"
                });
            }


            let sql = `DELETE FROM membership_plans WHERE id=?`;

            db.query(sql, [id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "membership plans delete successfully"
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