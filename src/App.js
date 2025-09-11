import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// --- Components ---
import AdminPanel from "./components/AdminPage";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import ChatbotTrainerUI_sociology from "./components/ChatbotTrainerUI_sociology";
import Ai_Learning from "./components/Ai_Learning";
import AiAvatar from "./components/AiAvatar";
import StudentReport from "./components/StudentReport";
import StudentUsageReport from "./components/StudentUsageReport";
import UserUsageDashboard from "./components/UserUsageDashboard";
import AiAudioLearning from "./components/AiAudioLearning";
import ResponseAnalyzer from "./components/ResponseAnalyzer";









import StudentDashboard from "./components/StudentDashboard";

// --- Login Page ---
function LoginPage({ setIsLoggedIn, setDoctorData, setSessionToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const server = "https://web-production-e5ae.up.railway.app";

  const handleLogin = async () => {
    try {
      setIsLoggedIn(false);
      setDoctorData(null);

      const response = await fetch(`${server}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setDoctorData(data);
        setSessionToken(data.session_token || null);
        setError(null);

        if (data?.id === 1) {
          navigate("/AdminPanel");
        } else if (data?.specialization === "sociology") {
          navigate("/StudentDashboard");
        } else {
          navigate("/"); // fallback
        }
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to login");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
          <button onClick={handleLogin} style={styles.button}>Login</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

// --- App ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    document.title = "Class Management System";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setDoctorData={setDoctorData} setSessionToken={setSessionToken} />} />

        {/* Admin Routes */}
        <Route path="/AdminPanel" element={isLoggedIn ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/add-doctor" element={isLoggedIn ? <AddDoctor /> : <Navigate to="/" />} />
        <Route path="/edit-doctor" element={isLoggedIn ? <EditDoctor /> : <Navigate to="/" />} />
        <Route path="/view-doctors" element={isLoggedIn ? <ViewDoctors /> : <Navigate to="/" />} />
        <Route path="/delete-doctor" element={isLoggedIn ? <DeleteDoctor /> : <Navigate to="/" />} />
        <Route path="/UserUsageDashboard" element={isLoggedIn ? <UserUsageDashboard /> : <Navigate to="/" />} />
        

        {/* Sociology Chatbot */}
        <Route
          path="/StudentDashboard/*"   // hypothetical subdomain-like namespace
          element={
            isLoggedIn ? (
              <StudentDashboard doctorData={doctorData} />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route
            index
            element={
              <div>
                Welcome to the Student Dashboard. Choose an option from the links above.
              </div>
            }
          />
          <Route
            path="ai_evaluator"
            element={<ChatbotTrainerUI_sociology doctorData={doctorData} />}
          />
          <Route
            path="Ai_Learning"
            element={<Ai_Learning doctorData={doctorData} />}
          />
          <Route
            path="AiAvatar"
            element={<AiAvatar doctorData={doctorData} />}
          />
          <Route
            path="StudentReport"
            element={<StudentReport doctorData={doctorData} />}
          />
          <Route
            path="StudentUsageReport"
            element={<StudentUsageReport doctorData={doctorData} />}
          />
          <Route
            path="UserUsageDashboard"
            element={<UserUsageDashboard doctorData={doctorData} />}
          />
          <Route
            path="AiAudioLearning"
            element={<AiAudioLearning doctorData={doctorData} />}
          />
          <Route
            path="ResponseAnalyzer"
            element={<ResponseAnalyzer doctorData={doctorData} />}
          />
                                            
        </Route>
          
      </Routes>
    </Router>
  );
}

// --- Styles ---
const styles = {
  container: { textAlign: "center", marginTop: "50px", padding: "20px", fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f4f4f4" },
  loginBox: { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", display: "inline-block" },
  input: { padding: "10px", margin: "10px", width: "80%", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "10px 20px", backgroundColor: "#0078D4", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  error: { color: "red", fontSize: "14px" },
};

export default App;
