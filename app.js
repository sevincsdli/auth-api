const express = require("express");
const app = express();

const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const db = require("./config/db");

app.use(cors());
require("dotenv").config();
const port = process.env.PORT;

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`Server is running on pobrt ${port}`);
});
