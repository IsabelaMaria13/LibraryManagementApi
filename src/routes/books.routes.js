const express = require("express");
const {addBooks} = require("../controllers/books.controller");


const booksRouter = express.Router();

booksRouter.post("/addBooks", addBooks);

module.exports = booksRouter;
