const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("../middleware/adminAuth");

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "divya321",
  database: "travel_db",
});

/* ================= ADMIN LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, data) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (data.length === 0) return res.status(404).json({ message: "Admin not found" });

    const admin = data[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "adminSecretKey",
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
});

/* ================= GET ALL USERS ================= */
router.get("/users", verifyAdmin, (req, res) => {
  db.query(
    "SELECT id, name, email, confirmed, last_login FROM users",
    (err, data) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(data);
    }
  );
});

/* ================= DELETE USER ================= */
router.delete("/users/:id", verifyAdmin, (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Delete failed" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
});

/* ================= CONFIRM USER ================= */
router.put("/confirm/:id", verifyAdmin, (req, res) => {
  const userId = req.params.id;

  db.query(
    "UPDATE users SET confirmed = 1 WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Confirm failed" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User confirmed" });
    }
  );
});

module.exports = router;
