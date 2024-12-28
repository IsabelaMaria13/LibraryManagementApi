const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./database/firebase");

const authRouter = require("./routes/auth.routes");
const booksRouter = require("./routes/books.routes");

const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/books", booksRouter);



module.exports = app;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}...`);
});
