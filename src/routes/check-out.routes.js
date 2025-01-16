const express = require("express");
const {checkoutBook} = require("../controllers/check-out.controller");

const checkoutRouter = express.Router();
checkoutRouter.post("/checkout", checkoutBook);

module.exports =  checkoutRouter;

