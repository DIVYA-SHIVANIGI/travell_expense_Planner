import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function AddExpenses() {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));

    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const categories = [
        "Food",
        "Travel",
        "Stay",
        "Hotel Stay",
        "Shopping",
        "Trekking",
        "Others"
    ];

    useEffect(() => {
        if (!tripId) return;

        axios
            .get(`http://localhost:5000/trip-participants/${tripId}`)
            .then(res => {
                const pts = res.data.map(p => ({ ...p, id: Number(p.id) }));
                setParticipants(pts);

                if (pts.length === 1) setSelectedParticipant(pts[0].id);
            })
            .catch(err => console.error(err));
    }, [tripId]);

    const handleAddExpense = () => {
        if (!selectedParticipant || !category || !amount) {
            alert("⚠️ Please fill all required fields!");
            return;
        }

        axios
            .post("http://localhost:5000/expenses", {
                trip_id: tripId,
                user_id: Number(selectedParticipant),
                category,
                description,
                amount: parseFloat(amount),
            })
            .then(() => {
                alert("✅ Expense added successfully!");
                setCategory("");
                setDescription("");
                setAmount("");
                setSelectedParticipant("");
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data?.message || "❌ Error adding expense");
            });
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.title}>Add Expense</h2>

                <label style={styles.label}>Select Participant:</label>
                {participants.length === 0 ? (
                    <p style={{ color: "#fff" }}>
                        No participants selected for this trip.
                    </p>
                ) : (
                    <select
                        style={styles.input}
                        value={selectedParticipant}
                        onChange={e => setSelectedParticipant(e.target.value)}
                    >
                        <option value="">-- Select Participant --</option>
                        {participants.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.email})
                            </option>
                        ))}
                    </select>
                )}

                <input
                    style={styles.input}
                    type="text"
                    placeholder="Category (e.g., Food, Travel, Stay)"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                />

                {/* Quick Category Suggestions */}
                <div style={styles.categoryContainer}>
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            style={{
                                ...styles.categoryButton,
                                backgroundColor:
                                    category === cat ? "#4CAF50" : "rgba(255,255,255,0.2)",
                            }}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <input
                    style={styles.input}
                    type="text"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                <input
                    style={styles.input}
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />

                <button style={styles.btn} onClick={handleAddExpense}>
                    💰 Add Expense
                </button>

                <button
                    style={styles.backBtn}
                    onClick={() => navigate(`/trip-overview/${tripId}`)}
                >
                    🔙 Back to Overview
                </button>
            </div>
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
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
    },
    container: {
        width: "400px",
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#fff",
    },
    title: {
        fontSize: "28px",
        marginBottom: "20px",
        fontWeight: "600",
        textAlign: "center",
        color: "#fff",
    },
    label: {
        alignSelf: "flex-start",
        marginBottom: "5px",
        fontSize: "14px",
        color: "#fff",
    },
    input: {
        width: "100%",
        padding: "10px",
        margin: "10px 0",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        outline: "none",
    },
    categoryContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "10px",
        justifyContent: "center",
    },
    categoryButton: {
        padding: "8px 12px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#fff",
        transition: "0.3s",
    },
    btn: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#4CAF50",
        color: "#fff",
        fontSize: "16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "15px",
        transition: "0.3s",
    },
    backBtn: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#2196F3",
        color: "#fff",
        fontSize: "16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "10px",
        transition: "0.3s",
    },
};

export default AddExpenses;
