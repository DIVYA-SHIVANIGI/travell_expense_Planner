import React, { useEffect, useState } from "react";
import "./ViewReports.css";

const ViewReports = () => {
  const [report, setReport] = useState({
    total_users: 0,
    total_trips: 0,
    total_budget: 0,
    total_spent: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/reports")
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Error fetching reports:", err));
  }, []);

  return (
    <div className="view-reports-container">
      <h2 className="view-reports-title">📊 Admin Reports Overview</h2>

      <div className="reports-grid">
        <div className="report-card users">
          <h3>Total Users</h3>
          <p>{report.total_users}</p>
        </div>

        <div className="report-card trips">
          <h3>Total Trips</h3>
          <p>{report.total_trips}</p>
        </div>

        <div className="report-card budget">
          <h3>Total Budget</h3>
          <p>₹{report.total_budget}</p>
        </div>

        <div className="report-card spent">
          <h3>Total Spent</h3>
          <p>₹{report.total_spent}</p>
        </div>
      </div>

      <div className="back-container">
        <button className="back-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ViewReports;
