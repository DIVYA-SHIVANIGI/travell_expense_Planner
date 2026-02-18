import React, { useEffect, useState } from "react";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Load users when page mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Handle delete click (opens confirmation popup)
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  // ✅ Confirm delete user
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `http://localhost:5000/api/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("User deleted successfully!");
        fetchUsers(); // 🔁 Refresh list after delete
        setShowConfirm(false);
        setSelectedUser(null);
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ✅ Confirm (approve) user
  const handleConfirmUser = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `http://localhost:5000/api/admin/confirm/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("User confirmed successfully!");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, confirmed: 1 } : u))
        );
      } else {
        alert(data.message || "Failed to confirm user.");
      }
    } catch (err) {
      console.error("Error confirming user:", err);
    }
  };

  return (
    <div className="manage-users-container">
      <h2 className="manage-users-title">Manage Users 👥</h2>

      <table className="manage-users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Confirmed</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.confirmed ? (
                    <span className="confirmed-status">✅ Yes</span>
                  ) : (
                    <span className="pending-status">⏳ No</span>
                  )}
                </td>
                <td>
                  {u.last_login
                    ? new Date(u.last_login).toLocaleString()
                    : "Never"}
                </td>
                <td>
                  {!u.confirmed && (
                    <button
                      className="confirm-btn"
                      onClick={() => handleConfirmUser(u.id)}
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(u)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-users">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Delete Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Are you sure?</h3>
            <p>
              Do you really want to delete <b>{selectedUser.name}</b>?
            </p>
            <div className="confirm-buttons">
              <button className="yes-btn" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button
                className="no-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Back Button */}
      <div className="back-container">
        <button className="back-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ManageUsers;
