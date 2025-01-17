const express = require("express");
const {checkInBook} = require("../controllers/check-in.controller");

const checkInRouter = express.Router();
checkInRouter.post("/checkIn", checkInBook);

module.exports =  checkInRouter;

