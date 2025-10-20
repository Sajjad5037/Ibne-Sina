import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// --- Components ---
import AdminPanel from "./components/AdminPage";
import AddDoctor from "./components/AddDoctorPage";
import EditDoctor from "./components/EditDoctorPage";
import ViewDoctors from "./components/ViewDoctors";
import DeleteDoctor from "./components/DeleteDoctor";
import ChatbotTraining from "./components/ChatbotTraining"; // ✅ new component

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

        // ✅ Navigation logic
        if (data?.id === 1) {
          navigate("/AdminPanel");
        } else if (data?.specialization === "chatbot") {
          navigate("/ChatbotTraining");
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
        <div style={styles.buttonRow}>
          <button onClick={handleLogin} style={styles.button}>
            Login
          </button>
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
    document.title = "ChatForMe AI - Business Chatbot";
  }, []);

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            <LoginPage
              setIsLoggedIn={setIsLoggedIn}
              setDoctorData={setDoctorData}
              setSessionToken={setSessionToken}
            />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/AdminPanel"
          element={isLoggedIn ? <AdminPanel /> : <Navigate to="/" />}
        />
        <Route
          path="/add-doctor"
          element={isLoggedIn ? <AddDoctor /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-doctor"
          element={isLoggedIn ? <EditDoctor /> : <Navigate to="/" />}
        />
        <Route
          path="/view-doctors"
          element={isLoggedIn ? <ViewDoctors /> : <Navigate to="/" />}
        />
        <Route
          path="/delete-doctor"
          element={isLoggedIn ? <DeleteDoctor /> : <Navigate to="/" />}
        />

        {/* ✅ Chatbot Training Route */}
        <Route
          path="/ChatbotTraining"
          element={isLoggedIn ? <ChatbotTraining /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

// --- Styles ---
const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f4f4f4",
  },
  loginBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    display: "inline-block",
  },
  input: {
    padding: "10px",
    margin: "10px",
    width: "80%",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0078D4",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonRow: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" },
  error: { color: "red", fontSize: "14px" },
};

export default App;
