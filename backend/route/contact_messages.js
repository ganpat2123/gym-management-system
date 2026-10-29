const express = require("express");
const router = express.Router();

const {isLogin,isAdmin} = require("../middleware/middleware.js");
const controller = require("../controller/contact_messages");

router.post("/", controller.new );

router.get("/", isLogin, isAdmin, controller.allCon);

router.get("/:id", isLogin, isAdmin, controller.one);

router.delete("/:id", isLogin, isAdmin, controller.delete);

module.exports = router;