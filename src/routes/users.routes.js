const express = require("express");
const { getUsers } = require("../controllers/users.controller");

const usersRouter = express.Router();

usersRouter.get("/users", getUsers);

module.exports = usersRouter;
