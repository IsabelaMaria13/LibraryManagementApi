const express = require("express");
const {checkInBook, getLoans} = require("../controllers/check-in.controller");

const checkInRouter = express.Router();
checkInRouter.post("/checkIn", checkInBook);
checkInRouter.get("/loans", getLoans);

module.exports =  checkInRouter;

