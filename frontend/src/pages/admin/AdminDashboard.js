import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // if you’re storing token
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-card">
        <h2>Welcome Admin 👑</h2>
        <p>Here you can manage users, trips, and expenses.</p>

        <div className="admin-options">
          <button onClick={() => navigate("/admin/manage-users")} className="option-btn">
            Manage Users
          </button>
          <button onClick={() => navigate("/admin/manage-trips")} className="option-btn">
            Manage Trips
          </button>
          <button onClick={() => navigate("/admin/view-reports")} className="option-btn">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
