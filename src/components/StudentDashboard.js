// StudentDashboard.js
import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import axios from "axios";

const StudentDashboard = ({ doctorData }) => {
  const [activeLink, setActiveLink] = useState("ai_evaluator");
  const [accessAllowed, setAccessAllowed] = useState(null); // null = loading

  useEffect(() => {
    // Check user's access based on cost
    const checkAccess = async () => {
      try {
        const response = await axios.get(
          `https://usefulapis-production.up.railway.app/check-user-access?username=${doctorData.name}`
        );
        setAccessAllowed(response.data.access_allowed);
      } catch (error) {
        console.error("Failed to check access:", error);
        setAccessAllowed(false);
      }
    };

    checkAccess();
  }, [doctorData.name]);

  if (accessAllowed === null) {
    return <div>Loading dashboard...</div>;
  }

  if (!accessAllowed) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "18px", color: "#b91c1c" }}>
        ❌ Access Restricted: You have exceeded your allowed usage limit.
      </div>
    );
  }

  const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f9fc",
    margin: 0,
    color: "#333",
  },
  header: {
    padding: "8px 12px",          // smaller
    backgroundColor: "#1e3a8a",
    color: "#fff",
    fontSize: "14px",             // smaller text
    fontWeight: "bold",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  navBar: {
    display: "flex",
    gap: "8px",                   // reduced again
    backgroundColor: "#fff",
    padding: "6px 10px",          // smaller
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    fontSize: "13px",             // slightly smaller
  },
  navLink: (isActive) => ({
    textDecoration: "none",
    color: isActive ? "#1e3a8a" : "#555",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: "13px",             // reduced
    padding: "3px 6px",           // tighter spacing
    borderRadius: "3px",
    backgroundColor: isActive ? "#e0e7ff" : "transparent",
    transition: "all 0.3s ease",
  }),
  mainContent: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    padding: "8px",               // smaller
    borderRadius: 0,
    boxShadow: "none",
    overflowY: "auto",
    boxSizing: "border-box",
  },
};


  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>ANZWAY --- Learning That Works!!!</header>

      {/* NavBar */}
      <nav style={styles.navBar}>
        <Link
          to="/StudentDashboard/ai_evaluator"
          style={styles.navLink(activeLink === "ai_evaluator")}
          onClick={() => setActiveLink("ai_evaluator")}
        >
          📝 AI Evaluator
        </Link>
        <Link
          to="/StudentDashboard/ai_learning"
          style={styles.navLink(activeLink === "ai_learning")}
          onClick={() => setActiveLink("ai_learning")}
        >
          AI Interactive Learning
        </Link>
        <Link
          to="/StudentDashboard/StudentReport"
          style={styles.navLink(activeLink === "StudentReport")}
          onClick={() => setActiveLink("StudentReport")}
        >
          Exams Preparation Status
        </Link>
        <Link
          to="/StudentDashboard/AiAudioLearning"
          style={styles.navLink(activeLink === "AiAudioLearning")}
          onClick={() => setActiveLink("AiAudioLearning")}
        >
          Talk to the AI
        </Link>
        <Link
          to="/StudentDashboard/StudentUsageReport"
          style={styles.navLink(activeLink === "StudentUsageReport")}
          onClick={() => setActiveLink("StudentUsageReport")}
        >
          App Usage
        </Link>
        <Link
          to="/StudentDashboard/ResponseAnalyzer"
          style={styles.navLink(activeLink === "ResponseAnalyzer")}
          onClick={() => setActiveLink("ResponseAnalyzer")}
        >
          Response Analyzer
        </Link>
      </nav>
      

      {/* Main Content */}
      <main
  style={{
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    padding: "20px",
    overflowY: "auto",
    boxSizing: "border-box",
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      padding: "0 20px",
      boxSizing: "border-box",
    }}
  >
    <Outlet />
  </div>
</main>




    </div>
  );
};

export default StudentDashboard;
