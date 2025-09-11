// StudentEvaluationReport.js
import React, { useState } from "react";

const ResponseAnalyzer = ({ doctorData }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // new states for totals
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [avgRelevancy, setAvgRelevancy] = useState(0);

  const fetchEvaluationData = async () => {
  console.log("🔄 FetchEvaluationData triggered...");
  setLoading(true);
  setError("");

  try {
    const query = new URLSearchParams();

    // ✅ map doctorData.name → username (since backend requires username)
    if (doctorData.name) {
      query.append("username", doctorData.name);
    }

    if (fromDate) query.append("from_date", fromDate);
    if (toDate) query.append("to_date", toDate);

    const url = `https://usefulapis-production.up.railway.app/response_analyzer_anzway?${query.toString()}`;
    console.log("📡 Fetching data from backend:", url);

    const response = await fetch(url);
    console.log("📥 Raw response:", response);

    if (!response.ok) {
      console.error("❌ Backend responded with error:", response.status, response.statusText);
      throw new Error("Failed to fetch evaluation data");
    }

    const data = await response.json();
    console.log("✅ Parsed JSON from backend:", data);

    setStudents(data.student_entries || []);
    setTotalMinutes(data.total_minutes || 0);
    setAvgRelevancy(data.average_relevancy_percentage || 0);

  } catch (err) {
    console.error("🔥 Error in fetchEvaluationData:", err);
    setError("Failed to fetch evaluation data. Please try again later.");
  } finally {
    console.log("✅ Fetch cycle complete. Loading set to false.");
    setLoading(false);
  }
};


  // Fetch when check button is clicked
  const handleCheck = () => {
    console.log("🖱️ Check button clicked. Doctor data:", doctorData);
    if (doctorData?.id && doctorData?.name) {
      fetchEvaluationData();
    } else {
      console.warn("⚠️ Missing doctorData (id or name). Skipping fetch.");
    }
  };

  return (
    <div
      style={{
        width: "100%",          // ✅ take full width
        maxWidth: "100%",       // ✅ no restriction
        margin: "40px 0",       // ✅ keep top/bottom spacing, no side gaps
        padding: "20px",        // ✅ keep padding inside
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box" // ✅ include padding in width
      }}
    >

      
      {/* ✅ summary sentence above title */}
      {!loading && !error && totalMinutes > 0 && (
        <div style={{ marginBottom: "20px", fontSize: "16px" }}>
          The student has spent <strong>{totalMinutes}</strong> mins and has been contextually relevant <strong>{avgRelevancy}%</strong> of the time.
        </div>
      )}

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Student Evaluation Report</h2>

      {/* Date Filters + Check Button */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          From Date
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              console.log("📅 From Date changed:", e.target.value);
              setFromDate(e.target.value);
            }}
            style={{ padding: "8px", marginTop: "4px" }}
          />
        </label>

        <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          To Date
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              console.log("📅 To Date changed:", e.target.value);
              setToDate(e.target.value);
            }}
            style={{ padding: "8px", marginTop: "4px" }}
          />
        </label>

        <button
          onClick={handleCheck}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Check
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading data...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {/* Table with required columns */}
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a", color: "#fff" }}>
              <th style={{ padding: "10px", textAlign: "right" }}>Relevancy (%)</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Comment</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: "10px", textAlign: "center" }}>
                  No student data found
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                console.log(`📋 Rendering row ${idx}:`, student);
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "right",
                        color:
                          student.relevancy_percentage >= 80
                            ? "green"
                            : student.relevancy_percentage >= 50
                            ? "orange"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {student.relevancy_percentage}%
                    </td>
                    <td style={{ padding: "10px" }}>{student.comment}</td>
                    <td style={{ padding: "10px" }}>
                      {new Date(student.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ResponseAnalyzer;
