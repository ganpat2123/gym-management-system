
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const port = process.env.PORT || 8080;

const routerUser = require("./route/user.js");
const routerTrai = require("./route/trainer.js");
const routerMemPla = require("./route/membership-plans.js");
const routerMem = require("./route/membership.js");
const routerPay = require("./route/payments.js");
const routerCon = require("./route/contact_messages.js");

require("./config/db.js");

// Allowed frontend websites
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("GYM PRO Backend API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "GYM PRO API is running"
  });
});

app.use("/api/users", routerUser);
app.use("/api/trainers", routerTrai);
app.use("/api/membership-plans", routerMemPla);
app.use("/api/memberships", routerMem);
app.use("/api/payments", routerPay);
app.use("/api/contact-messages", routerCon);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
