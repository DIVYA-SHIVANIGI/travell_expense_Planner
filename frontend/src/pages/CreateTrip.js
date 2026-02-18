import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function CreateTrip() {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));

    const [destination, setDestination] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:5000/users")
            .then(res => {
                const others = res.data
                    .filter(u => Number(u.id) !== Number(user.id))
                    .map(u => ({ ...u, id: Number(u.id) }));
                setUsers(others);
            })
            .catch(err => console.error(err));
    }, [user.id]);

    useEffect(() => {
        if (!tripId) return;

        axios
            .get(`http://localhost:5000/trip-details/${tripId}`)
            .then(res => {
                const trip = res.data.trip;
                setDestination(trip.destination);
                setStartLocation(trip.start_location);
                setEndLocation(trip.end_location);
                setStartDate(trip.start_date.split("T")[0]);
                setEndDate(trip.end_date.split("T")[0]);
                setBudget(trip.budget);

                axios
                    .get(`http://localhost:5000/trip-participants/${tripId}`)
                    .then(resp => {
                        const ids = resp.data.map(p => Number(p.id));
                        setSelectedParticipants(ids);
                    })
                    .catch(err => console.error(err));
            })
            .catch(err => console.error(err));
    }, [tripId]);

    const handleCheckboxChange = (userId) => {
        setSelectedParticipants(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleCreateTrip = () => {
        if (!destination || !startDate || !endDate || !budget) {
            alert("⚠️ Please fill all required fields!");
            return;
        }

        axios.post("http://localhost:5000/trips", {
            user_id: Number(user.id),
            destination,
            start_location: startLocation,
            end_location: endLocation,
            start_date: startDate,
            end_date: endDate,
            budget: parseFloat(budget),
            participants: selectedParticipants,
        })
        .then(() => {
            alert("✅ Trip created successfully!");
            navigate("/dashboard");
        })
        .catch(err => {
            console.error(err);
            alert(err.response?.data?.message || "❌ Error creating trip");
        });
    };

    const handleBack = () => {
        navigate("/dashboard");
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.title}>Create New Trip</h2>

                <input style={styles.input} placeholder="Destination"
                    value={destination} onChange={e => setDestination(e.target.value)} />
                <input style={styles.input} placeholder="Start Location"
                    value={startLocation} onChange={e => setStartLocation(e.target.value)} />
                <input style={styles.input} placeholder="End Location"
                    value={endLocation} onChange={e => setEndLocation(e.target.value)} />
                <input style={styles.input} type="date"
                    value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input style={styles.input} type="date"
                    value={endDate} onChange={e => setEndDate(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Budget"
                    value={budget} onChange={e => setBudget(e.target.value)} />

                <label style={styles.label}>Select Participants</label>

                <div style={styles.checkboxContainer}>
                    {users.map(u => (
                        <label
                            key={u.id}
                            style={{
                                ...styles.checkboxLabel,
                                ...(selectedParticipants.includes(u.id)
                                    ? styles.checkboxSelected
                                    : {})
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedParticipants.includes(u.id)}
                                onChange={() => handleCheckboxChange(u.id)}
                                style={styles.checkboxInput}
                            />
                            <div>
                                <div style={styles.participantName}>{u.name}</div>
                                <div style={styles.participantEmail}>{u.email}</div>
                            </div>
                        </label>
                    ))}
                </div>

                <button style={styles.btn} onClick={handleCreateTrip}>
                    ✈️ {tripId ? "Update Trip" : "Create Trip"}
                </button>

                <button style={styles.backBtn} onClick={handleBack}>
                    ← Back
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
    },
    container: {
        width: "450px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "20px",
        color: "#fff",
    },
    title: { fontSize: "26px", marginBottom: "20px" },
    input: {
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "none",
    },

    label: { marginTop: "10px", fontWeight: "600" },

    checkboxContainer: {
        width: "100%",
        maxHeight: "260px",
        overflowY: "auto",
        marginTop: "10px",
    },

    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        borderRadius: "10px",
        marginBottom: "8px",
        background: "rgba(255,255,255,0.85)",
        color: "#111",
        cursor: "pointer",
        transition: "0.25s",
    },

    checkboxSelected: {
        background: "#ecfdf5",
        border: "2px solid #22c55e",
    },

    checkboxInput: { transform: "scale(1.2)" },

    participantName: { fontSize: "14px", fontWeight: "600" },
    participantEmail: { fontSize: "12px", color: "#6b7280" },

    btn: {
        width: "100%",
        padding: "12px",
        background: "#4CAF50",
        border: "none",
        borderRadius: "8px",
        marginTop: "15px",
        color: "#fff",
        cursor: "pointer",
    },
    backBtn: {
        width: "100%",
        padding: "12px",
        background: "#3498db",
        border: "none",
        borderRadius: "8px",
        marginTop: "10px",
        color: "#fff",
        cursor: "pointer",
    },
};

export default CreateTrip;
