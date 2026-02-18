import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams, useNavigate } from "react-router-dom";

function TripOverview() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [budgetAlert, setBudgetAlert] = useState(""); // Budget alert
  const [summary, setSummary] = useState(null); // Summary card state
  const [allUsers, setAllUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    // Fetch Trip Details + Expenses
    axios
      .get(`http://localhost:5000/trip-details/${tripId}`)
      .then((res) => {
        setTrip(res.data.trip);
        setExpenses(res.data.expenses);
      })
      .catch((err) => console.error(err));

    // Fetch Trip Summary for Summary Card
    axios
      .get(`http://localhost:5000/trip/${tripId}/summary`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Error fetching summary:", err));
    axios.get("http://localhost:5000/users")
  .then(res => setAllUsers(res.data))
  .catch(err => console.log(err));

axios.get(`http://localhost:5000/trip-participants/${tripId}`)
  .then(res => setParticipants(res.data))
  .catch(err => console.log(err));
 
  }, [tripId]);

  const totalExpenses = expenses.reduce(
    (acc, e) => acc + parseFloat(e.amount),
    0
  );
  const remainingBudget = trip.budget ? trip.budget - totalExpenses : 0;

  // Budget Alert Logic
  useEffect(() => {
    if (trip.budget) {
      const percentUsed = (totalExpenses / trip.budget) * 100;
      if (percentUsed >= 100) {
        setBudgetAlert("⚠️ You have exceeded your trip budget!");
      } else if (percentUsed >= 90) {
        setBudgetAlert("⚠️ Warning: You have used 90% of your budget!");
      } else if (percentUsed >= 75) {
        setBudgetAlert("⚠️ Caution: 75% of your budget is used!");
      } else {
        setBudgetAlert("");
      }
    }
  }, [trip.budget, totalExpenses]);

  const handleBack = () => {
    navigate("/dashboard");
  };
  const addParticipant = () => {
  if (!selectedUser) {
    alert("Select a user");
    return;
  }

  axios.post("http://localhost:5000/trip-participants", {
    trip_id: tripId,
    user_id: selectedUser
  })
  .then(() => {
    alert("User added to trip");
    window.location.reload();
  })
  .catch(() => {
    alert("User already in trip");
  });
};


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>{trip.destination} Overview</h2>
        <div style={{ background: "#f0f4ff", padding: "15px", borderRadius: "10px", margin: "20px 0" }}>
  <h3>👥 Participants</h3>

  {participants.map(p => (
    <p key={p.id}>• {p.name}</p>
  ))}

  <div style={{ marginTop: "10px" }}>
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      style={{ padding: "8px", borderRadius: "6px" }}
    >
      <option value="">Select user</option>
      {allUsers.map(u => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>

    <button
      onClick={addParticipant}
      style={{ marginLeft: "10px", padding: "8px 16px", borderRadius: "6px", background: "#28a745", color: "#fff", border: "none" }}
    >
      ➕ Add
    </button>
  </div>
</div>

        <p>Total Budget: ${trip.budget}</p>
        <p>Total Expenses: ${totalExpenses}</p>
        <p>Remaining Budget: ${remainingBudget}</p>

        {/* Budget Warning Alert */}
        {budgetAlert && (
          <div style={styles.alertBox}>
            <strong>{budgetAlert}</strong>
          </div>
        )}

        {/* Trip Summary Card */}
        {summary && (
          <div
            style={{
              border: "2px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              margin: "20px 0",
              backgroundColor:
                summary.status === "Exceeded"
                  ? "#ffcccc"
                  : summary.status === "Warning"
                  ? "#fff3cd"
                  : "#d4edda",
            }}
          >
            <h3>🧾 Expense Summary</h3>
            <p>
              📍 <strong>Destination:</strong> {summary.destination}
            </p>
            <p>
              💰 <strong>Budget:</strong> ${summary.budget}
            </p>
            <p>
              💸 <strong>Total Spent:</strong> ${summary.total_expenses}
            </p>
            <p>
              🧾 <strong>Remaining:</strong> ${summary.remaining_budget}
            </p>
            <p>
              ⚠️ <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    summary.status === "Exceeded"
                      ? "red"
                      : summary.status === "Warning"
                      ? "orange"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {summary.status}
              </span>
            </p>

            {/* ✅ Progress Bar */}
            <div
              style={{
                width: "100%",
                height: "20px",
                backgroundColor: "#e0e0e0",
                borderRadius: "10px",
                overflow: "hidden",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  width: `${
                    ((summary.total_expenses / summary.budget) * 100).toFixed(2)
                  }%`,
                  height: "100%",
                  backgroundColor:
                    summary.status === "Exceeded"
                      ? "red"
                      : summary.status === "Warning"
                      ? "orange"
                      : "green",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>
          </div>
        )}

        <h3>Expenses Breakdown</h3>
        {expenses.length === 0 && <p>No expenses added yet</p>}
        {expenses.map((e) => (
          <div key={e.id} style={styles.expenseCard}>
            <p>
              <strong>Category:</strong> {e.category}
            </p>
            <p>
              <strong>Description:</strong> {e.description}
            </p>
            <p>
              <strong>Amount:</strong> ${e.amount}
            </p>
            <p>
              <strong>Added by:</strong> {e.added_by}
            </p>
          </div>
        ))}

        <button
          style={styles.btn}
          onClick={() => navigate(`/add-expenses/${tripId}`)}
        >
          Add Expense
        </button>
      </div>

      <button style={styles.backBtn} onClick={handleBack}>
        ← Back
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "50px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  container: {
    width: "700px",
    padding: "30px",
    borderRadius: "12px",
    background: "rgba(11, 2, 2, 0.54)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    fontFamily: "Poppins, sans-serif",
    textAlign: "center",
    marginBottom: "60px",
  },
  expenseCard: {
    padding: "15px",
    margin: "15px 0",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  alertBox: {
    backgroundColor: "#ffcc00",
    color: "#000",
    padding: "10px",
    borderRadius: "8px",
    margin: "15px 0",
    fontWeight: "bold",
  },
  btn: {
    marginTop: "20px",
    padding: "14px 30px",
    borderRadius: "6px",
    border: "none",
    background: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  backBtn: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 30px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    zIndex: 1000,
  },
};

export default TripOverview;
