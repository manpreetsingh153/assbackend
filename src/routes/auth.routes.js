import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  //   console.log(username, email, password);
  if (!username || !email || password.length < 6) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    //   console.log(existingUser);
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res
      .status(200)
      .json({ message: "Registration successfully!!!!!!!" });
  } catch (error) {}
});

router.post("/login", async (req, res) => {
  const { identifier, password, token } = req.body;
  console.log(identifier, password);
  if (!identifier || !password) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res
        .status(400)
        .json({ error: "Invalid reCAPTCHA. Please try again." });
    }
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [identifier]
    );
    //   console.log(userQuery.rows);
    if (userQuery.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = userQuery.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Incorrect password" });

    const tokenJWT = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    //   console.log(tokenJWT);
    const Option = {
      maxAge: 3600000,
      httpOnly: true,
    };
    res.cookie("token", tokenJWT, Option);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  //   console.log(req.user);
  try {
    const user = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
