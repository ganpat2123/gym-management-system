
const mysql = require("mysql2");
const fs = require("fs");

const useSSL =
  process.env.DB_SSL === "true" ||
  process.env.NODE_ENV === "production";

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 20000
};

if (useSSL) {
  config.ssl = {
    rejectUnauthorized: true,
    ...(process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(
            process.env.DB_SSL_CA_PATH,
            "utf8"
          )
        }
      : {})
  };
}

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.error(
      "Database connection failed:",
      err.code || err.message
    );
    return;
  }

  console.log("Database connected successfully");
});

module.exports = db;
