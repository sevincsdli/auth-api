const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const db = require("../config/db");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRegex = !/[!@#$%^&*(),.?":{}|<>]/;
const mysql = require("mysql");
const util = require("util");

require("dotenv").config();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PASSWORD,
  database: "auth",
  port: "3306",
});
const query = util.promisify(db.query).bind(db);

const register = async (req, res) => {
  const { email, password, repassword } = req.body;

  try {
    if (!email || !password || !repassword) {
      return res
        .status(401)
        .json({ message: "Zəhmət olmasa, formu tam doldurun." });
    }
    if (password != repassword) {
      return res.status(400).json({ message: "Şifrələr eyni deyil." });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(401)
        .json({ message: "Zəhmət olmasa, düzgün e-mail daxil edin." });
    }

    if (
      password.length < 6 ||
      !/\d/.test(password) ||
      passRegex.test(password)
    ) {
      return res.status(401).json({
        message:
          "Şifrə ən az 6 simvol,ən az bir rəqəm və bir simvoldan ibarət olmalıdır.",
      });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const hashedrePassword = bcrypt.hashSync(repassword, 10);
    const checkUser = "SELECT * FROM users WHERE email = ?";
    const existingUser = await db.query(checkUser, [email]);

    if (existingUser.length > 0) {
      return res.status(401).json({ message: "İstifadəçi artıq mövcuddur." });
    }

    const sql = "INSERT INTO users (email, password, repassword) VALUES (?, ?, ?)";
    await db.query(sql, [email, hashedPassword, hashedrePassword]);

    return res.status(201).json({ message: "Qeydiyyatınız uğurla tamamlanmışdır." });

      // const sql =
      //   "INSERT INTO users (email,password,repassword) VALUES (?, ?, ?)";
      // await db.query(
      //   sql,
      //   [email, hashedPassword, hashedrePassword],
      //   (err, result) => {
      //     if (err) throw err;

      //     res
      //       .status(201)
      //       .json({ message: "Qeydiyyatınız uğurla tamamlanmışdır.", result });
      //   }
      // );

  } catch (err) {
    return res.status(501).json({ message: err });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Formu tam doldurun." });
    }

    const checkUser = "SELECT * FROM users WHERE email = ?";
    const existingUser = await db.query(checkUser, [email]);

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Belə bir istifadəçi mövcud deyil." });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(401)
        .json({ message: "Zəhmət olmasa, düzgün e-mail daxil edin." });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const checkPass = bcrypt.compareSync(password, results[0].password);

        if (checkPass) {
          const token = jwt.sign(
            { userId: results[0].id },
            process.env.SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.json({ token });
        } else {
          res
            .status(401)
            .json({ message: "Zəhmət olmasa, düzgün şifrəni daxil edin." });
        }
      }
    });
  } catch (err) {
    return res.status(501).json({ message: err });
  }
};
module.exports = {
  register,
  login,
};
