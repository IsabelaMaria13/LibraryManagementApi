const express = require("express");
const { register, login, profile, changePassword} = require("../controllers/auth.controller")

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/profile/:id", profile);
authRouter.post("/changePassword", changePassword);


module.exports = authRouter;