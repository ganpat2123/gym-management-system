
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

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 20000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

if (useSSL) {
  config.ssl = {
    minVersion: "TLSv1.2",
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

const db = mysql.createPool(config);

// Verify connection when the backend starts
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("Database connection failed:", {
      code: err.code,
      message: err.message
    });
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = db;
