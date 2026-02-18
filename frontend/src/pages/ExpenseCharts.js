import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ExpenseCharts = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noExpense, setNoExpense] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Load trips
  useEffect(() => {
    if (!userId) return;
    axios
      .get("http://localhost:5000/trips", { params: { user_id: userId } })
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Error fetching trips:", err));
  }, [userId]);

  // 🔥 FIXED expense grouping logic
  const fetchExpenses = async (tripId) => {
    if (!tripId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/trip-details/${tripId}`);

      if (res.data.expenses && res.data.expenses.length > 0) {
        const sumMap = {};
        let total = 0;

        res.data.expenses.forEach((e) => {
          const cat = e.category.trim().toUpperCase(); // 🔥 normalize
          const amount = parseFloat(e.amount);

          if (!sumMap[cat]) sumMap[cat] = 0;
          sumMap[cat] += amount;
          total += amount;
        });

        setTotalExpense(total);

        const summedExpenses = Object.keys(sumMap).map((cat) => ({
          category: cat.charAt(0) + cat.slice(1).toLowerCase(), // Travel, Food
          amount: sumMap[cat],
        }));

        setExpenses(summedExpenses);
        setNoExpense(false);
      } else {
        setExpenses([]);
        setTotalExpense(0);
        setNoExpense(true);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setNoExpense(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    setSelectedTrip(tripId);
    fetchExpenses(tripId);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const pieData = {
    labels: expenses.map((e) => e.category),
    datasets: [
      {
        data: expenses.map((e) => e.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
          "#FF7043",
          "#00BCD4",
          "#FFC107",
        ],
      },
    ],
  };

  const barData = {
    labels: expenses.map((e) => e.category),
    datasets: [
      {
        label: "Amount Spent",
        data: expenses.map((e) => e.amount),
        backgroundColor: "#42A5F5",
        borderRadius: 6,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value, ctx) => {
          let sum = 0;
          ctx.chart.data.datasets[0].data.forEach((d) => (sum += d));
          return ((value * 100) / sum).toFixed(1) + "%";
        },
        font: { weight: "bold" },
      },
      legend: { position: "bottom" },
    },
  };

  const barOptions = {
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value) => value.toFixed(2),
        color: "#000",
      },
      legend: { display: false },
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>💸 Expense Analytics</h2>

        <div style={styles.dropdownContainer}>
          <label style={styles.label}>Select a Trip:</label>
          <select
            value={selectedTrip}
            onChange={handleTripChange}
            style={styles.dropdown}
          >
            <option value="">-- Choose Trip --</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination} ({trip.start_date} → {trip.end_date})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={styles.loading}>Fetching data...</p>
        ) : noExpense ? (
          <p style={styles.noExpense}>⚠️ No expenses added yet.</p>
        ) : expenses.length > 0 ? (
          <>
            <h3 style={styles.totalExpense}>
              Total Spent: ₹{totalExpense.toFixed(2)}
            </h3>

            <div style={styles.chartContainer}>
              <div style={styles.chartBox}>
                <h4>Pie Chart</h4>
                <Pie data={pieData} options={pieOptions} />
              </div>

              <div style={styles.chartBox}>
                <h4>Bar Chart</h4>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <button style={styles.backBtn} onClick={handleBack}>
              ← Back
            </button>
          </>
        ) : (
          <p>Select a trip to visualize expenses 📊</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
  },
  container: {
    width: "90%",
    maxWidth: "1000px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  backBtn: {
    padding: "10px 16px",
    marginTop: "25px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    cursor: "pointer",
  },
  title: { fontSize: "28px", marginBottom: "20px" },
  totalExpense: { fontSize: "22px", color: "#e74c3c", marginBottom: "20px" },
  dropdownContainer: { marginBottom: "25px" },
  label: { marginRight: "10px" },
  dropdown: { padding: "10px", borderRadius: "8px" },
  chartContainer: { display: "flex", gap: "40px", justifyContent: "center" },
  chartBox: {
    width: "400px",
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
  },
  loading: { color: "#2980b9" },
  noExpense: { color: "#7f8c8d" },
};

export default ExpenseCharts;
