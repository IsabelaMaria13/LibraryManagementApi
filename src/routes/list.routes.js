const express = require("express");
const {getBooks, updateBook, deleteBook} = require("../controllers/list.controller");

const listBooks = express.Router();
listBooks.get("/getBooks", getBooks);
listBooks.put("/updateBook/:id", updateBook)
listBooks.delete("/deleteBook/:id", deleteBook);

module.exports = listBooks ;