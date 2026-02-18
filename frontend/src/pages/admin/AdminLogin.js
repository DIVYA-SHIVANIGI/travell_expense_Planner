import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css"; // ✅ Admin Login Card CSS

function AdminLogin() {
  const [email, setEmail] = useState(""); // ✅ use 'email', not 'username'
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      // ✅ backend returns token on success
      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        alert("✅ Admin Login Successful!");
        navigate("/admin/dashboard");
      } else {
        alert("Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login 👑</h2>

        <input
          className="admin-login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="admin-login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="admin-login-btn" onClick={handleAdminLogin}>
          Login
        </button>

        <p className="admin-login-footer">
          Not an admin?{" "}
          <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
            Go to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
