require("dotenv").config();

const express = require('express');
const app = express();
const port = 8080;
const mysql = require('mysql2');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routerUser = require("./route/user.js");
const routerTrai = require("./route/trainer.js");
const routerMemPla = require("./route/membership-plans.js");
const routerMem = require("./route/membership.js");
const routerPay = require("./route/payments.js");
const routerCon = require("./route/contact_messages.js");

const db = require("./config/db");

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hi,I am root!");
});

app.use("/api/users",routerUser);
app.use("/api/trainers",routerTrai);
app.use("/api/membership-plans",routerMemPla);
app.use("/api/memberships",routerMem);
app.use("/api/payments",routerPay);
app.use("/api/contact-messages",routerCon);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});