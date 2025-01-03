const express = require("express");
const {getBooks} = require("../controllers/list.controller");

const listBooks = express.Router();
listBooks.get("/getBooks", getBooks);

module.exports = listBooks ;