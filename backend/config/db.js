const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = db;