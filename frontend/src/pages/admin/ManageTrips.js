import React, { useEffect, useState } from "react";
import "./ManageTrips.css";

const ManageTrips = () => {
  const [trips, setTrips] = useState([]);

  // ✅ Fetch all trips when component loads
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/trips")
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error("Error fetching trips:", err));
  }, []);

  // ✅ Delete Trip
  const handleDelete = (trip_id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      fetch(`http://localhost:5000/api/admin/trips/${trip_id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("Trip deleted successfully!");
          setTrips(trips.filter((t) => t.trip_id !== trip_id));
        })
        .catch((err) => console.error("Error deleting trip:", err));
    }
  };

  return (
    <div className="manage-trips-container">
      <h2 className="manage-trips-title">Manage Trips ✈️</h2>

      <table className="manage-trips-table">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>User Name</th>
            <th>User Email</th>
            <th>Start Location</th>
            <th>End Location</th>
            <th>Destination</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Cost</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trips.length > 0 ? (
            trips.map((trip) => (
              <tr key={trip.trip_id}>
                <td>{trip.trip_id}</td>
                <td>{trip.user_name}</td>
                <td>{trip.user_email}</td>
                <td>{trip.start_location}</td>
                <td>{trip.end_location}</td>
                <td>{trip.destination}</td>
                <td>{new Date(trip.start_date).toLocaleDateString()}</td>
                <td>{new Date(trip.end_date).toLocaleDateString()}</td>
                <td>₹{trip.total_cost}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(trip.trip_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No trips found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Back Button */}
      <div className="back-container">
        <button className="back-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ManageTrips;
