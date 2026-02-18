const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // ✅ Added for bill upload
const path = require("path");     // ✅ Added for file paths
const fs = require("fs");         // ✅ Added to create uploads folder if missing

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup for bills
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "divya321",
  database: "travel_db",
});

db.connect((err) => {
  if (err) console.log("❌ DB connection error:", err);
  else console.log("✅ Connected to MySQL");
});

// ====== AUTH ROUTES ======
// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      (err) => {
        if (err) return res.status(500).json({ message: "Error registering user" });
        res.json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== USER LOGIN =====
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  // Step 1: Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, data) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (data.length === 0)
      return res.status(401).json({ message: "Invalid email" });

    const user = data[0];

    // Step 2: Compare password (secure)
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    // Step 3: Update last_login
    db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    // Step 4: Create token
    const token = jwt.sign({ id: user.id, email: user.email }, "secret123", {
      expiresIn: "1d",
    });

    // Step 5: Send response
    res.json({ message: "Login successful", token, user });
  });
});

// ====== TRIP ROUTES ======
// Create Trip
app.post("/trips", (req, res) => {
  const {
    user_id,
    destination,
    start_location,
    end_location,
    start_date,
    end_date,
    budget,
    participants,
  } = req.body;

  db.query(
    "INSERT INTO trips (user_id, destination, start_date, end_date, budget, start_location, end_location) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [user_id, destination, start_date, end_date, budget, start_location, end_location],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error creating trip" });

      const trip_id = result.insertId;

      // Add creator automatically to participants
      let allParticipants = participants ? [...participants] : [];
      if (!allParticipants.includes(user_id)) allParticipants.push(user_id);

      if (allParticipants.length > 0) {
        const placeholders = allParticipants.map(() => "(?, ?)").join(", ");
        const flatValues = allParticipants.flatMap((p) => [trip_id, p]);
        db.query(
          `INSERT INTO trip_participants (trip_id, user_id) VALUES ${placeholders}`,
          flatValues,
          (err2) => {
            if (err2)
              return res.status(500).json({ message: "Error saving participants" });
            res.json({ message: "Trip created successfully" });
          }
        );
      } else {
        res.json({ message: "Trip created successfully" });
      }
    }
  );
});

// Get all trips for a user
app.get("/trips", (req, res) => {
  const { user_id } = req.query;
  db.query("SELECT * FROM trips WHERE user_id = ?", [user_id], (err, data) => {
    if (err) return res.status(500).json({ message: "Error fetching trips" });
    res.json(data);
  });
});

// Get all users
app.get("/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, data) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(data);
  });
});

// Get participants for a trip
app.get("/trip-participants/:tripId", (req, res) => {
  const { tripId } = req.params;
  db.query(
    "SELECT u.id, u.name, u.email FROM users u JOIN trip_participants tp ON u.id = tp.user_id WHERE tp.trip_id = ?",
    [tripId],
    (err, data) => {
      if (err) return res.status(500).json({ message: "Error fetching participants" });
      res.json(data);
    }
  );
});

// ===== EXPENSE ROUTES =====
// Add expense
app.post("/expenses", (req, res) => {
  const { trip_id, user_id, category, description, amount } = req.body;
  db.query(
    "INSERT INTO expenses (trip_id, user_id, category, description, amount) VALUES (?, ?, ?, ?, ?)",
    [trip_id, user_id, category, description, amount],
    (err) => {
      if (err) return res.status(500).json({ message: "Error adding expense" });
      res.json({ message: "Expense added successfully" });
    }
  );
});

// Get trip details + expenses
app.get("/trip-details/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM trips WHERE id = ?", [id], (err, tripResult) => {
    if (err || tripResult.length === 0)
      return res.status(404).json({ message: "Trip not found" });

    db.query(
      `SELECT e.id, e.category, e.description, e.amount, e.user_id, u.name AS added_by
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE e.trip_id = ?`,
      [id],
      (err2, expenses) => {
        if (err2)
          return res.status(500).json({ message: "Error fetching expenses" });
        res.json({ trip: tripResult[0], expenses });
      }
    );
  });
});

// ====== SETTLEMENT =====
app.get("/settlement/:tripId", (req, res) => {
  const { tripId } = req.params;

  db.query(
    "SELECT u.id, u.name FROM users u JOIN trip_participants tp ON u.id = tp.user_id WHERE tp.trip_id = ?",
    [tripId],
    (err, participants) => {
      if (err) return res.status(500).json({ message: "Error fetching participants" });
      if (participants.length === 0)
        return res.status(404).json({ message: "No participants found" });

      db.query(
        `SELECT e.id, e.user_id, e.amount, u.name AS added_by
         FROM expenses e
         JOIN users u ON e.user_id = u.id
         WHERE e.trip_id = ?`,
        [tripId],
        (err2, expenses) => {
          if (err2) return res.status(500).json({ message: "Error fetching expenses" });

          const totalExpense = expenses.reduce(
            (sum, e) => sum + parseFloat(e.amount),
            0
          );

          const paidMap = {};
          participants.forEach((p) => (paidMap[p.id] = 0));
          expenses.forEach((e) => (paidMap[e.user_id] += parseFloat(e.amount)));

          const averageShare = totalExpense / participants.length;

          const balances = participants.map((p) => ({
            id: p.id,
            name: p.name,
            paid: paidMap[p.id],
            balance: parseFloat((paidMap[p.id] - averageShare).toFixed(2)),
          }));

          res.json({
            totalExpense,
            averageShare,
            participants,
            expenses,
            balances,
          });
        }
      );
    }
  );
});

// ====== DELETE EXPENSE =====
app.delete("/expenses/:expenseId", (req, res) => {
  const { expenseId } = req.params;

  db.query("DELETE FROM expenses WHERE id = ?", [expenseId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting expense" });

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted successfully" });
  });
});

// ====== BILL UPLOAD MODULE =====

// Upload a bill for a trip
app.post("/trips/:tripId/upload-bill", upload.single("bill"), (req, res) => {
  const { tripId } = req.params;
  const { user_id } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  db.query(
    "INSERT INTO trip_bills (trip_id, user_id, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())",
    [tripId, user_id, file.originalname, file.path],
    (err) => {
      if (err) return res.status(500).json({ message: "Error saving bill" });
      res.json({ message: "Bill uploaded successfully", file });
    }
  );
});

// Get all bills for a trip
app.get("/trips/:tripId/bills", (req, res) => {
  const { tripId } = req.params;
  db.query(
    `SELECT tb.id, tb.file_name, tb.file_path, tb.uploaded_at, u.name AS uploaded_by
     FROM trip_bills tb
     JOIN users u ON tb.user_id = u.id
     WHERE tb.trip_id = ?`,
    [tripId],
    (err, data) => {
      if (err) return res.status(500).json({ message: "Error fetching bills" });
      res.json(data);
    }
  );
});

// Download a specific bill
app.get("/trips/bill/:billId/download", (req, res) => {
  const { billId } = req.params;
  db.query(
    "SELECT file_name, file_path FROM trip_bills WHERE id = ?",
    [billId],
    (err, data) => {
      if (err || data.length === 0)
        return res.status(404).json({ message: "Bill not found" });
      const bill = data[0];
      if (!fs.existsSync(bill.file_path))
        return res.status(404).json({ message: "File not found on server" });
      res.download(bill.file_path, bill.file_name);
    }
  );
});
// ✅ ALL YOUR EXISTING CODE REMAINS EXACTLY SAME ABOVE THIS LINE

// ===== GET TRIP DETAILS + EXPENSES (UPDATED CALCULATION ADDED) =====
app.get("/trip-details/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM trips WHERE id = ?", [id], (err, tripResult) => {
    if (err || tripResult.length === 0)
      return res.status(404).json({ message: "Trip not found" });

    const trip = tripResult[0];

    db.query(
      `SELECT e.id, e.category, e.description, e.amount, e.user_id, u.name AS added_by
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE e.trip_id = ?`,
      [id],
      (err2, expenses) => {
        if (err2)
          return res.status(500).json({ message: "Error fetching expenses" });

        // ✅ Calculate total spent amount
        const totalSpent = expenses.reduce(
          (sum, e) => sum + parseFloat(e.amount || 0),
          0
        );

        // ✅ Add calculated values dynamically
        const remaining = parseFloat(trip.budget) - totalSpent;
        const percentage = ((totalSpent / parseFloat(trip.budget)) * 100).toFixed(2);

        // ✅ Send full trip data along with expenses and calculations
        res.json({
          trip: {
            ...trip,
            totalSpent,
            remaining: remaining < 0 ? 0 : remaining,
            percentage: percentage > 100 ? 100 : parseFloat(percentage),
          },
          expenses,
        });
      }
    );
  });
});

// ✅ ALL OTHER ROUTES (upload bill, delete, settlement, etc.) REMAIN SAME
// ===== ADMIN LOGIN =====
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  // Simple static admin credentials (you can replace with DB lookup if needed)
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ role: "admin", email }, "secretAdmin123", {
      expiresIn: "1d",
    });
    return res.json({ message: "Admin login successful", token });
  }

  res.status(401).json({ message: "Invalid email or password" });
});
// ===== ADMIN DASHBOARD DATA =====
app.get("/api/admin/stats", (req, res) => {
  const stats = {};

  // Total users
  db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, userResult) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    stats.totalUsers = userResult[0].totalUsers;

    // Total trips
    db.query("SELECT COUNT(*) AS totalTrips FROM trips", (err2, tripResult) => {
      if (err2) return res.status(500).json({ message: "Error fetching trips" });
      stats.totalTrips = tripResult[0].totalTrips;

      // Total expenses
      db.query(
        "SELECT IFNULL(SUM(amount), 0) AS totalExpenses FROM expenses",
        (err3, expenseResult) => {
          if (err3)
            return res.status(500).json({ message: "Error fetching expenses" });
          stats.totalExpenses = expenseResult[0].totalExpenses;

          res.json(stats);
        }
      );
    });
  });
});
// ===== USER LOGIN =====


app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  });
});
// ✅ Confirm (approve) user
// ✅ Confirm (approve) user
app.put("/api/admin/confirm/:id", (req, res) => {
  const userId = req.params.id;
  console.log("✅ Confirm route hit for user:", userId);

  const sql = "UPDATE users SET confirmed = 1 WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ Error confirming user:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("🟢 DB Update result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Fetch the updated user record immediately
    db.query(
      "SELECT id, name, email, confirmed, DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') AS last_login FROM users WHERE id = ?",
      [userId],
      (err2, userResult) => {
        if (err2 || userResult.length === 0)
          return res.status(500).json({ message: "Error fetching updated user" });
        res.json({ message: "User confirmed successfully!", user: userResult[0] });
      }
    );
  });
});



// ===== ADMIN - GET ALL TRIPS =====
// ===== ADMIN MANAGE TRIPS =====
/// ===== ADMIN - FETCH ALL USERS =====
app.get("/api/admin/users", (req, res) => {
  const sql = `
    SELECT 
      id, 
      name, 
      email, 
      confirmed, 
      DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') AS last_login 
    FROM users
  `;
  
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(result);
  });
});

// ===== ADMIN - FETCH ALL TRIPS =====
// ===== ADMIN - GET ALL TRIPS =====
// ===== ADMIN - FETCH ALL TRIPS =====
// ✅ ADMIN - FETCH ALL TRIPS (FIXED VERSION)
// ===== ADMIN MANAGE TRIPS =====
app.get("/api/admin/trips", (req, res) => {
  const query = `
    SELECT 
      trips.id AS trip_id,
      users.name AS user_name,
      users.email AS user_email,
      trips.start_location,
      trips.end_location,
      trips.destination,
      trips.start_date,
      trips.end_date,
      trips.budget AS total_cost
    FROM trips
    JOIN users ON trips.user_id = users.id
    ORDER BY trips.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching trips:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});
// ✅ ADMIN - VIEW REPORTS (DASHBOARD STATS)
app.get("/api/admin/reports", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM trips) AS total_trips,
      (SELECT IFNULL(SUM(budget), 0) FROM trips) AS total_budget,
      (SELECT IFNULL(SUM(amount), 0) FROM expenses) AS total_spent
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching reports:", err);
      return res.status(500).json({ message: "Database error" });
    }
    console.log("✅ Reports fetched successfully");
    res.json(result[0]);
  });
});
// ➕ ADD USER TO EXISTING TRIP
// ➕ Add user to existing trip
app.post("/trip-participants", (req, res) => {
  const { trip_id, user_id } = req.body;

  db.query(
    "INSERT INTO trip_participants (trip_id, user_id) VALUES (?, ?)",
    [trip_id, user_id],
    (err) => {
      if (err)
        return res
          .status(400)
          .json({ message: "User already added or DB error" });

      res.json({ message: "User added to trip successfully" });
    }
  );
});





// ====== START SERVER ======
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
