const express = require("express");
const {getBooks, updateBook} = require("../controllers/list.controller");

const listBooks = express.Router();
listBooks.get("/getBooks", getBooks);
listBooks.put("/updateBook/:id", updateBook)

module.exports = listBooks ;