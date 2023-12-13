const mysql = require("mysql");

require("dotenv").config();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PASSWORD,
  database: "auth",
  port: "3306",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected database!");
});

module.exports = db;
