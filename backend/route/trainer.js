const express = require("express");
const router = express.Router();

const {isLogin,isAdmin} = require("../middleware/middleware.js");
const controller = require("../controller/trainer");

router.post("/", isLogin, isAdmin, controller.new);

router.get("/", controller.allTrai);

router.get("/:id",controller.one);

router.put("/:id", isLogin, isAdmin, controller.update );

router.delete("/:id", isLogin, isAdmin, controller.delete );

module.exports = router;