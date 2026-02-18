import homepageImage from "../assets/Homepage.png";
import dashboardImg from "../assets/Dashboard.png";
import expenseChartImg from "../assets/ExpenseChart.png";
import createTripImg from "../assets/CreateTrip.png";
import overviewImg from "../assets/Overview.png";
import detailsImg from "../assets/DetailsPage.png";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaPlane,
  FaWallet,
  FaChartPie,
  FaFileDownload,
  FaExchangeAlt,
  FaReceipt,
  FaMoon,
  FaSun
} from "react-icons/fa";
import { useEffect, useState } from "react";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const handleCreateTrip = () => {
    const user = localStorage.getItem("user");
    if (user) navigate("/create-trip");
    else navigate("/register");
  };

  // Dark / Light toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Scroll animation
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".animate").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [theme]);

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">Travel Expense Planner</h2>

        <ul className="menu">
  <li onClick={() => navigate("/")}>Home</li>

  <li onClick={() => navigate("/dashboard")}>Trips</li>

  <li onClick={() => navigate("/expense-charts")}>Expenses</li>

  <li onClick={() => navigate("/reports")}>Reports</li>
</ul>


        <div className="nav-actions">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="primary" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero animate">
  <h1>Plan and Track Travel Expenses Efficiently</h1>
  <p>
    Create trips, set budgets, track expenses, and analyze spending —
    all from one place.
  </p>

  <button className="primary big" onClick={handleCreateTrip}>
    <FaPlus /> Create New Trip
  </button>

  
</section>
      {/* APP PREVIEW */}



      {/* SCREENSHOTS */}
  <section className="screenshots animate">
  <h2>How Travel Expense Planner Works</h2>

  <div className="preview-container">

    <div className="main-preview">
      <img src={dashboardImg} alt="Dashboard" />
      <p>Dashboard</p>
    </div>

    <div className="sub-previews">
      <div className="feature-shot">
    <img src={createTripImg} alt="Create Trip" />
    <h3>Create Trip</h3>
    <p>Set destination, budget, dates and participants in seconds.</p>
  </div>

  <div className="feature-shot">
    <img src={overviewImg} alt="Trip Overview" />
    <h3>Trip Overview</h3>
    <p>See who spent how much and track your full trip summary.</p>
  </div>

  <div className="feature-shot">
    <img src={expenseChartImg} alt="Expense Chart" />
    <h3>Expense Chart</h3>
    <p>Visual breakdown of spending with charts and categories.</p>
  </div>

  <div className="feature-shot">
    <img src={detailsImg} alt="Trip Details" />
    <h3>Trip Details</h3>
    <p>View bills, uploads, settlements and full expense history.</p>
  </div>

</div>

  </div>
</section>


      {/* FEATURES */}
      <section className="features-section animate">
        <h2>Key Features</h2>

        <div className="features-grid">
          <div className="feature-box" onClick={handleCreateTrip}>
            <FaPlane />
            <h4>Create Trip</h4>
            <p>Create trips with budget and dates</p>
          </div>

          <div className="feature-box">
            <FaWallet />
            <h4>Add Expense</h4>
            <p>Record and track all expenses</p>
          </div>

          <div className="feature-box">
            <FaExchangeAlt />
            <h4>Settlement</h4>
            <p>Automatically calculate who pays whom</p>
          </div>

          <div className="feature-box">
            <FaReceipt />
            <h4>Download Receipt</h4>
            <p>Download expense reports</p>
          </div>

          <div className="feature-box">
            <FaChartPie />
            <h4>Easy to Use</h4>
            <p>Simple and user-friendly interface</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta animate">
        <h2>Start Managing Your Travel Expenses Smarter</h2>
        <button className="primary big" onClick={handleCreateTrip}>
          Start Your First Trip
        </button>
      </section>

      {/* FOOTER */}
      <footer>
        © 2025 Travel Expense Planner | Smart travel finance management
      </footer>
    </div>
  );
}

export default HomePage;
