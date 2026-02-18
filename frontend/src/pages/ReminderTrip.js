// frontend/src/pages/ReminderTrip.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function ReminderTrip() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:5000/trips?user_id=${user.id}`)
      .then((res) => {
        const today = new Date();
        const notif = [];

        res.data.forEach((trip) => {
          const startDate = new Date(trip.start_date);
          const diffTime = startDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 5) {
            notif.push(`Hey ${user.name}! Your trip "${trip.destination}" is in 5 days! Are you excited? 🌴✈️`);
          } else if (diffDays === 4) {
            notif.push(`Heyyy ${user.name}, your trip "${trip.destination}" is in 4 days! Did you start packing your bags? 🎒 Don't rush at the end!`);
          } else if (diffDays === 3) {
            notif.push(`Hey ${user.name}, only 3 days left for "${trip.destination}"! Don't forget to enjoy each moment! 🏖️ Pack your essentials!`);
          } else if (diffDays === 2) {
            notif.push(`Almost there ${user.name}! 2 days left for "${trip.destination}". Make sure your travel checklist is ready! 📋`);
          } else if (diffDays === 1) {
            notif.push(`Tomorrow's the day ${user.name}! Your trip "${trip.destination}" is finally here! 🎉 Travel safe and have fun!`);
          }
        });

        setNotifications(notif);
      })
      .catch((err) => console.error(err));
  }, [user]);

  if (!user || notifications.length === 0) return null;

  return (
    <div style={styles.container}>
      {notifications.map((note, idx) => (
        <div key={idx} style={styles.notification}>
          {note}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: "70px",
    right: "20px",
    width: "300px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  notification: {
    background: "rgba(255,255,255,0.95)",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
};

export default ReminderTrip;
