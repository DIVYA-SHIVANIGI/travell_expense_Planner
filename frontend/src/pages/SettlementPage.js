import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaWallet, FaUsers, FaMoneyBillWave } from "react-icons/fa";

function SettlementPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:5000/settlement/${tripId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [tripId, navigate, user]);

  if (!user) return null;
  if (loading) return <p style={styles.loading}>⏳ Loading settlement...</p>;
  if (!data) return <p>No settlement data found.</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          <FaWallet style={{ marginRight: "10px", color: "#00c4ff" }} />
          Settlement Summary
        </h2>
        <p style={styles.subtitle}>
          Trip ID: <strong>{tripId}</strong>
        </p>

        <div style={styles.summaryCard}>
          <p>
            <strong>💰 Total Expense:</strong> ${data.totalExpense.toFixed(2)}
          </p>
          <p>
            <strong>👥 Average Share:</strong> ${data.averageShare.toFixed(2)} per person
          </p>
        </div>

        {/* Participants Balances Section */}
        <h3 style={styles.sectionTitle}>
          <FaUsers style={{ marginRight: "8px" }} /> Participants Balances
        </h3>
        <table style={{ ...styles.table, ...styles.highlightTable }}>
          <thead>
            <tr>
              <th style={styles.highlightTh}>Name</th>
              <th style={styles.highlightTh}>Paid</th>
              <th style={styles.highlightTh}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.balances.map((p, index) => (
              <tr
                key={p.id}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? "rgba(255,255,255,0.85)" : "rgba(240,240,240,0.85)",
                }}
              >
                <td style={styles.highlightTd}>{p.name}</td>
                <td style={styles.highlightTd}>${p.paid.toFixed(2)}</td>
                <td style={styles.highlightTd}>
                  <span
                    style={{
                      ...styles.balanceChip,
                      backgroundColor:
                        p.balance > 0
                          ? "rgba(0, 255, 0, 0.2)"
                          : p.balance < 0
                          ? "rgba(255, 0, 0, 0.2)"
                          : "rgba(255,255,255,0.2)",
                      color:
                        p.balance > 0
                          ? "#008000"
                          : p.balance < 0
                          ? "#cc0000"
                          : "#000",
                    }}
                  >
                    ${p.balance.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Suggested Payments Section */}
        <h3 style={styles.sectionTitle}>
          <FaMoneyBillWave style={{ marginRight: "8px" }} /> Suggested Payments
        </h3>
        {generatePayments(data.balances).length === 0 ? (
          <p style={{ color: "#00ff88", fontWeight: "bold" }}>✅ All balances are settled!</p>
        ) : (
          <div style={styles.paymentBox}>
            {generatePayments(data.balances).map((t, idx) => (
              <div key={idx} style={styles.paymentItem}>
                💸 <strong>{t.from}</strong> pays <strong>{t.to}</strong> ${t.amount.toFixed(2)}
              </div>
            ))}
          </div>
        )}

        <button style={styles.btn} onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}

// Helper function to calculate payments
function generatePayments(balances) {
  const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));
  const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
  const payments = [];

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debt = -debtors[i].balance;
    const credit = creditors[j].balance;
    const amount = Math.min(debt, credit);

    payments.push({ from: debtors[i].name, to: creditors[j].name, amount });

    debtors[i].balance += amount;
    creditors[j].balance -= amount;

    if (Math.abs(debtors[i].balance) < 0.01) i++;
    if (Math.abs(creditors[j].balance) < 0.01) j++;
  }
  return payments;
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1650&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "50px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
  },
  container: {
    width: "750px",
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
    color: "#fff",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00c4ff",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "15px",
    marginBottom: "20px",
    color: "#ccc",
  },
  summaryCard: {
    background: "linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,0,255,0.2))",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "25px",
    fontSize: "18px",
    boxShadow: "0 2px 12px rgba(0,255,255,0.3)",
  },
  sectionTitle: {
    fontSize: "22px",
    margin: "20px 0 10px",
    color: "#ffd700",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "25px",
    borderRadius: "10px",
    overflow: "hidden",
  },
  highlightTable: {
    border: "1px solid #ddd",
  },
  highlightTh: {
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "700",
    padding: "10px",
  },
  highlightTd: {
    color: "#000",
    fontWeight: "600",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    border: "1px solid #ddd",
  },
  balanceChip: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
  },
  paymentBox: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "left",
  },
  paymentItem: {
    background: "rgba(0, 0, 0, 0.3)",
    padding: "8px 12px",
    margin: "6px 0",
    borderRadius: "8px",
    fontSize: "16px",
  },
  btn: {
    marginTop: "30px",
    padding: "12px 30px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#00c4ff",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  loading: {
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    textAlign: "center",
    marginTop: "200px",
  },
};

export default SettlementPage;
