import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./TripDetails.css";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState({});
  const [participants, setParticipants] = useState([]);
  const [bills, setBills] = useState([]);
  const [billFile, setBillFile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/trip-details/${tripId}`)
      .then(res => setTrip(res.data.trip))
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/trip-participants/${tripId}`)
      .then(res => setParticipants(res.data))
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/trips/${tripId}/bills`)
      .then(res => setBills(res.data))
      .catch(err => console.error(err));
  }, [tripId]);

  const handleBillUpload = () => {
    if (!billFile) return alert("Please select a file first");
    const formData = new FormData();
    formData.append("bill", billFile);
    formData.append("user_id", 1);

    axios.post(`http://localhost:5000/trips/${tripId}/upload-bill`, formData)
      .then(() => {
        alert("Bill uploaded successfully!");
        setBillFile(null);
        axios.get(`http://localhost:5000/trips/${tripId}/bills`)
          .then(res => setBills(res.data));
      })
      .catch(err => console.error(err));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="trip-details-wrapper">
      <div className="trip-details-card">
        <h2 className="trip-title">🌍 Trip Details</h2>

        <div className="trip-info-card">
          <p><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Start Date:</strong> {formatDate(trip.start_date)}</p>
          <p><strong>End Date:</strong> {formatDate(trip.end_date)}</p>
          <p><strong>Budget:</strong> ₹{trip.budget}</p>
        </div>

        <div className="trip-section">
          <h3>👥 Participants</h3>
          <div className="participants-grid">
            {participants.map(p => (
              <div key={p.id} className="participant-card">
                <strong>{p.name}</strong>
                <span>{p.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="trip-section upload-section">
          <h3>📄 Upload Bill</h3>
          <div className="upload-box">
            <input type="file" onChange={e => setBillFile(e.target.files[0])} />
            <button onClick={handleBillUpload}>Upload</button>
          </div>
        </div>

        <div className="trip-section">
          <h3>🧾 Uploaded Bills</h3>
          {bills.length === 0 ? (
            <p className="no-data">No bills uploaded yet.</p>
          ) : (
            <div className="bills-grid">
              {bills.map(b => (
                <div key={b.id} className="bill-card">
                  <p className="bill-name">{b.file_name}</p>
                  <p className="bill-meta">
                    Uploaded by <b>{b.uploaded_by}</b> on{" "}
                    {new Date(b.uploaded_at).toLocaleString()}
                  </p>
                  <a
                    href={`http://localhost:5000/trips/bill/${b.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ⬇ Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
      </div>
    </div>
  );
}

export default TripDetails;
