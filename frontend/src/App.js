import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import AddExpenses from "./pages/AddExpenses";
import TripOverview from "./pages/TripOverview";
import TripDetails from "./pages/TripDetails";
import SettlementPage from "./pages/SettlementPage";
import ExpenseCharts from "./pages/ExpenseCharts";
import ReminderTrip from "./pages/ReminderTrip";

// ✅ Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageTrips from "./pages/admin/ManageTrips";
import ViewReports from "./pages/admin/ViewReports";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ User Routes */}
        <Route path="/" element={<HomePage />} />
<Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/add-expenses/:tripId" element={<AddExpenses />} />
        <Route path="/trip-overview/:tripId" element={<TripOverview />} />
        <Route path="/trip/:tripId" element={<TripDetails />} />
        <Route path="/settlement/:tripId" element={<SettlementPage />} />
        <Route path="/reminder-trip" element={<ReminderTrip />} />
        <Route path="/expense-charts" element={<ExpenseCharts trips={[]} />} />

        {/* ✅ Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/manage-trips" element={<ManageTrips />} />
        <Route path="/admin/view-reports" element={<ViewReports />} />

        {/* 🔁 Optional backward compatibility */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
