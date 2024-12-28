const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./database/firebase");

const authRouter = require("./routes/auth.routes");

const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);


app.use("*", (req, res) => {
  res.status(404).json({ message: "Page not found." });
});

module.exports = app;
