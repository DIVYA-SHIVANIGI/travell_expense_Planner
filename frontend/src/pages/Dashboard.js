import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiBell } from "react-icons/fi"; // Bell icon
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [trips, setTrips] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fun reminder messages
    const generateReminderMessage = (trip, daysLeft) => {
        const name = user?.name || "Traveler";
        switch (daysLeft) {
            case 5:
                return `🎉 Hey ${name}! Your adventure to ${trip.destination} is in 5 days! 🏖️`;
            case 4:
                return `👜 Yo ${name}! Only 4 days left to ${trip.destination}! 😉`;
            case 3:
                return `🚀 Just 3 days to ${trip.destination}! 😎`;
            case 2:
                return `⏰ 2 days left for ${trip.destination}! ✈️`;
            case 1:
                return `🔥 It's tomorrow ${name}! ${trip.destination} awaits! 🎒`;
            default:
                return null;
        }
    };

    const getDaysLeft = (dateStr) => {
        const today = new Date();
        const tripDate = new Date(dateStr);
        return Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

        axios.get(`http://localhost:5000/trips?user_id=${user.id}`)
            .then((res) => {
                setTrips(res.data);

                // Notifications logic
                const upcomingNotifications = [];
                res.data.forEach((trip) => {
                    const daysLeft = getDaysLeft(trip.start_date);
                    const message = generateReminderMessage(trip, daysLeft);
                    if (message) upcomingNotifications.push({ id: trip.id, message });
                });
                setNotifications(upcomingNotifications);
            })
            .catch((err) => console.error(err));
    }, [navigate, user]);

    if (!user) return null;

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <div
                    style={styles.bellContainer}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown((prev) => !prev);
                    }}
                >
                    <FiBell size={28} color="#fff" />
                    {notifications.length > 0 && (
                        <span style={styles.notificationBadge}>{notifications.length}</span>
                    )}

                    {showDropdown && notifications.length > 0 && (
                        <div style={styles.dropdown}>
                            {notifications.map((n) => (
                                <div key={n.id} style={styles.dropdownItem}>{n.message}</div>
                            ))}
                        </div>
                    )}
                </div>
                <h2 style={styles.navTitle}>Travel Expense Planner</h2>
            </div>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.sidebarTitle}>Menu</h2>
                <ul style={styles.navList}>
                    <li
                        style={styles.navItem}
                        onClick={() => navigate("/create-trip")}
                    >
                        📝 Create Trip
                    </li>

                    <li
                        style={styles.navItem}
                        onClick={() => navigate("/expense-charts")}
                    >
                        📊 Expense Charts
                    </li>

                    <li
                        style={styles.navItem}
                        onClick={() => {
                            localStorage.removeItem("user");
                            navigate("/");
                        }}
                    >
                        🔓 Logout
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <div style={styles.welcomeCard}>
                    <h1>Welcome, {user.name}!</h1>
                    <p>Manage your trips and expenses efficiently.</p>
                </div>

                <div style={styles.tripsContainer}>
                    {trips.length === 0 ? (
                        <p>No trips found. Create one!</p>
                    ) : (
                        trips.map((trip) => (
                            <div key={trip.id} style={styles.tripCard}>
                                <h3>{trip.destination}</h3>
                                <p>{trip.start_date} to {trip.end_date}</p>
                                <p>Budget: ${trip.budget}</p>
                                <div style={styles.cardButtons}>
                                    <button
                                        style={styles.btn}
                                        onClick={() => navigate(`/add-expenses/${trip.id}`)}
                                    >
                                        Add Expense
                                    </button>
                                    <button
                                        style={styles.btn}
                                        onClick={() => navigate(`/trip-overview/${trip.id}`)}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        style={styles.btn}
                                        onClick={() => navigate(`/trip/${trip.id}`)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        style={{ ...styles.btn, background: "#ffc107" }}
                                        onClick={() => navigate(`/settlement/${trip.id}`)}
                                    >
                                        Settlement
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// ---------------- STYLES ----------------
const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1650&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
    },
    navbar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "60px",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        zIndex: 1000,
        color: "#fff",
    },
    bellContainer: { position: "relative", marginRight: "20px", cursor: "pointer" },
    notificationBadge: {
        position: "absolute",
        top: "-5px",
        left: "18px",
        background: "red",
        color: "#fff",
        borderRadius: "50%",
        padding: "2px 6px",
        fontSize: "12px",
        fontWeight: "bold",
    },
    navTitle: { fontSize: "20px", fontWeight: "600" },
    dropdown: {
        position: "absolute",
        top: "35px",
        left: "0",
        width: "350px",
        maxHeight: "300px",
        overflowY: "auto",
        background: "rgba(0, 0, 0, 0.95)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        borderRadius: "10px",
        padding: "10px",
        zIndex: 2000,
        color: "#fff",
    },
    dropdownItem: {
        padding: "8px",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        fontSize: "14px",
        color: "#fff",
    },
    sidebar: {
        width: "220px",
        marginTop: "60px",
        background: "rgba(0, 0, 0, 0.5)",
        padding: "30px 20px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "30px",
        borderRight: "1px solid rgba(255,255,255,0.1)",
    },
    sidebarTitle: {
        fontSize: "22px",
        fontWeight: "600",
        textAlign: "center",
        width: "100%",
        marginBottom: "20px",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        paddingBottom: "10px",
    },
    navList: {
        listStyle: "none",
        padding: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    navItem: {
        cursor: "pointer",
        padding: "10px 15px",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        width: "100%",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    mainContent: { flex: 1, padding: "100px 40px 40px 40px", overflowY: "auto" },
    welcomeCard: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "30px",
        borderRadius: "12px",
        marginBottom: "30px",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    },
    tripsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
    },
    tripCard: {
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    cardButtons: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "15px",
    },
    btn: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        background: "#28a745",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer",
    },
};

export default Dashboard;
