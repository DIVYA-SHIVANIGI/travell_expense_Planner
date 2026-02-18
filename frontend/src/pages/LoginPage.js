// frontend/src/pages/LoginPage.js
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    axios
      .post("http://localhost:5000/login", { email, password })
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      })
      .catch((err) =>
        alert(err.response?.data?.message || "Login failed")
      );
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        {/* ✅ Forgot Password Link under Login button */}
        <p style={{ textAlign: "center", margin: "10px 0" }}>
          <Link to="/forgot-password" className="login-link">
            Forgot Password?
          </Link>
        </p>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">
            Create an Account
          </Link>
        </p>

        <p className="login-footer admin-link">
          Are you an admin?{" "}
          <Link to="/admin/login" className="admin-login-btn">
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
