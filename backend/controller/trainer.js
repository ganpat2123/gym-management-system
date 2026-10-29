const db = require("../config/db");

module.exports.new = async (req, res) => {
    try {

        let { name, specialization, experience, phone, description, image } = req.body;

        if (!name || !specialization || !experience || !phone || !description || !image) {
            return res.status(400).json({
                status: false,
                message: "name, specialization, experience, phone, description, image are required!"
            });
        }

        if (isNaN(phone) || phone.length !== 10) {
            return res.status(400).json({
                status: false,
                message: "Phone number must be 10 digits"
            });
        }

        let sql = `INSERT INTO trainers (name,specialization,experience,phone,description,image) VALUES (?,?,?,?,?,?)`;

        db.query(sql, [name, specialization, experience, phone, description, image], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(201).json({
                status: true,
                message: "New Trainer create successfuly"
            });
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server side error"
        });
    }
};

module.exports.allTrai = async (req, res) => {
    try {
        let sql = `SELECT * FROM trainers`;
        db.query(sql, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Server side error"
                });
            }
            return res.status(200).json({
                status: true,
                message: "Show All Trainer successfully",
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

module.exports.one =  async (req, res) => {
    try {
        let { id } = req.params;
        let sql = `SELECT * FROM trainers WHERE id=?`;

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
                    message: "Trainer not found"
                });
            }

            let trainer = result[0];

            return res.status(200).json({
                status: true,
                message: "show individual trainer",
                data: trainer
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
        let { name, specialization, experience, phone, description, image } = req.body;

        if (!name || !specialization || !experience || !phone || !description || !image) {
            return res.status(400).json({
                status: false,
                message: "name, specialization, experience, phone, description, image are required!"
            });
        }

        if (isNaN(phone) || phone.length !== 10) {
            return res.status(400).json({
                status: false,
                message: "Phone number must be 10 digits"
            });
        }

        let sql1 = `SELECT * FROM trainers WHERE id=?`;

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
                    message: "Trainer not found"
                });
            }

            let sql = `UPDATE trainers SET name=?,specialization=?,experience=?,phone=?,description=?,image=? WHERE id =?`;

            db.query(sql, [name, specialization, experience, phone, description, image, id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "Trainer Update successfully"
                });

            })

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

        let sql1 = `SELECT * FROM trainers WHERE id=?`;

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
                    message: "trainer not found"
                });
            }


            let sql = `DELETE FROM trainers WHERE id=?`;

            db.query(sql, [id], async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server side error"
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "Trainer delete successfully"
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