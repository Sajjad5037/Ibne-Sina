import React, { useState } from "react";

const StudentReport = ({ doctorData }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [subject, setSubject] = useState("");
  const [reportData, setReportData] = useState([]);
  const [missingQuestions, setMissingQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchReport = async () => {
  if (!fromDate || !toDate || !subject) {
    alert("Please select From Date, To Date, and Subject.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // 1️⃣ Fetch completed reflections
    const response = await fetch(
      "https://usefulapis-production.up.railway.app/student_report",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: doctorData.id,
          from_date: fromDate,
          to_date: toDate,
          subject: subject,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch report");
    const reflections = await response.json();
    setReportData(reflections);

    // 2️⃣ Fetch all questions
    const questionsRes = await fetch(
      "https://usefulapis-production.up.railway.app/questions_a_level"
    );
    if (!questionsRes.ok) throw new Error("Failed to fetch questions");
    const allQuestions = await questionsRes.json();

    // 🔍 Debug logs
    console.log("All Questions:", allQuestions);
    console.log("Reflections:", reflections);

    // 3️⃣ Normalize answered question_texts
    const answeredTexts = new Set(
      reflections.map((r) => r.question_text.trim().toLowerCase())
    );

    console.log("Answered:", answeredTexts);
    console.log("Selected Subject:", subject);

    // 4️⃣ Filter missing questions (normalize subject + question text)
    const missing = allQuestions.filter(
      (q) =>
        q.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
        !answeredTexts.has(q.question_text.trim().toLowerCase())
    );

    console.log("Missing:", missing);

    setMissingQuestions(missing);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch report. Please try again later.");
    setReportData([]);
    setMissingQuestions([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        padding: "30px 0",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Student Reflection Report
      </h2>

      {/* Filter Card */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "500", color: "#555" }}>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "8px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "500", color: "#555" }}>To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "8px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "500", color: "#555" }}>Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              display: "block",
              marginTop: "5px",
              padding: "8px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            <option value="">-- Select Subject --</option>
            <option value="sociology">sociology</option>
            <option value="Economics">Economics</option>
          </select>
        </div>

        <button
          onClick={handleFetchReport}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.3s",
          }}
          disabled={loading}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = "#0056b3";
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = "#007bff";
          }}
        >
          {loading ? "Creating Report..." : "Create Report"}
        </button>
      </div>

      {/* Status */}
      {loading && <p style={{ textAlign: "center" }}>Loading report...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Report 1: Completed reflections */}
      {reportData.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>
            ✅ Completed Reflections
          </h3>
          <div
            style={{
              overflowX: "auto",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "600px",
              }}
            >
              <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
                <tr>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>Question</th>
                  <th style={{ padding: "12px" }}>Preparedness</th>
                  <th style={{ padding: "12px" }}>Subject</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.id} style={{ backgroundColor: "#fafafa" }}>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {item.question_text}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {item.preparedness_level}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {item.subject}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Missing questions */}
      {missingQuestions.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "10px", color: "#333" }}>
            ❌ Pending Questions (Not Yet Reflected)
          </h3>
          <div
            style={{
              overflowX: "auto",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "600px",
              }}
            >
              <thead style={{ backgroundColor: "#dc3545", color: "#fff" }}>
                <tr>
                  <th style={{ padding: "12px" }}>Question</th>
                  <th style={{ padding: "12px" }}>Subject</th>
                </tr>
              </thead>
              <tbody>
                {missingQuestions.map((q) => (
                  <tr key={q.id} style={{ backgroundColor: "#fff8f8" }}>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {q.question_text}
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e0e0e0" }}>
                      {q.subject}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading &&
        reportData.length === 0 &&
        missingQuestions.length === 0 && (
          <p style={{ textAlign: "center", color: "#555", marginTop: "20px" }}>
            No records found for the selected dates and subject.
          </p>
        )}
    </div>
  );
};

export default StudentReport;
