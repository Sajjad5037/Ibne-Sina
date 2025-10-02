
import React, { useState, useEffect } from "react";


const StudentReport = ({ doctorData }) => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [subject, setSubject] = useState("");
    const [reportData, setReportData] = useState([]);
    const [missingQuestions, setMissingQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [wellPreparedReport, setWellPreparedReport] = useState([]); // first report
    const [notPreparedReport, setNotPreparedReport] = useState([]);   // second report


  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          "https://usefulapis-production.up.railway.app/distinct_subjects_ibne_sina"
        );
        if (!response.ok) throw new Error("Failed to fetch subjects");
  
        const data = await response.json();
  
        // Handle both array and object responses
        let subjects = [];
        if (Array.isArray(data)) {
          subjects = data;
        } else if (data.subjects && Array.isArray(data.subjects)) {
          subjects = data.subjects;
        } else {
          console.warn("Unexpected response format for subjects:", data);
        }
  
        console.log("Fetched subjects:", subjects);
        setSubjectOptions(subjects);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjectOptions([]);
      }
    };
  
    fetchSubjects();
  }, []);

  const handleFetchReports = async () => {
  if (!subject) {
    alert("Please select a Subject.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // --- 1️⃣ Fetch well-prepared report ---
    const wellPreparedRes = await fetch(
      "https://usefulapis-production.up.railway.app/student_report_ibne_sina",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: String(doctorData.id),
          student_name: doctorData.name,
          subject: subject,
        }),
      }
    );

    if (!wellPreparedRes.ok) throw new Error("Failed to fetch well-prepared report");

    const wellPreparedData = await wellPreparedRes.json();
    console.log("Well-prepared report:", wellPreparedData);
    setWellPreparedReport(wellPreparedData);

    // --- 2️⃣ Fetch all chapters from syllabus ---
    const syllabusRes = await fetch(
      "https://usefulapis-production.up.railway.app/syllabus_ibne_sina",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject }),
      }
    );

    if (!syllabusRes.ok) throw new Error("Failed to fetch syllabus");

    const syllabusData = await syllabusRes.json();
    console.log("All chapters from syllabus:", syllabusData);

    // --- 3️⃣ Filter chapters not in well-prepared report ---
    const notPreparedData = syllabusData.filter(
      (chapter) => !wellPreparedData.some(
        (wp) => wp.pdf_name === chapter.chapter // assuming first report uses pdf_name as chapter identifier
      )
    );

    console.log("Not prepared report:", notPreparedData);
    setNotPreparedReport(notPreparedData);

  } catch (err) {
    console.error(err);
    setError("Failed to fetch reports. Please try again later.");
    setWellPreparedReport([]);
    setNotPreparedReport([]);
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
          {subjectOptions.map((subj, idx) => (
            <option key={idx} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleFetchReports}
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
        {loading ? "Creating Reports..." : "Create Reports"}
      </button>
    </div>

    {/* Status */}
    {loading && <p style={{ textAlign: "center" }}>Loading reports...</p>}
    {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

    {/* Report 1: Well-prepared chapters */}
    {wellPreparedReport.length > 0 && (
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "10px", color: "#333" }}>✅ Well-Prepared Chapters</h3>
        <div style={{ overflowX: "auto", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>Chapter Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Subject</th>
                <th style={{ padding: "12px", textAlign: "left" }}>PDF Name</th>
              </tr>
            </thead>
            <tbody>
              {wellPreparedReport.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: "#fafafa" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>{item.chapter}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>{item.subject}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>
                    {item.image_urls.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Report 2: Not-prepared chapters */}
    {notPreparedReport.length > 0 && (
      <div>
        <h3 style={{ marginBottom: "10px", color: "#333" }}>❌ Chapters Not Yet Prepared</h3>
        <div style={{ overflowX: "auto", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead style={{ backgroundColor: "#dc3545", color: "#fff" }}>
              <tr>
                <th style={{ padding: "12px" }}>Chapter Name</th>
                <th style={{ padding: "12px" }}>Subject</th>
                <th style={{ padding: "12px" }}>PDF Name</th>
              </tr>
            </thead>
            <tbody>
              {notPreparedReport.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: "#fff8f8" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>{item.chapter}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>{item.subject}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #e0e0e0" }}>
                    {item.image_urls.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {!loading && wellPreparedReport.length === 0 && notPreparedReport.length === 0 && (
      <p style={{ textAlign: "center", color: "#555", marginTop: "20px" }}>
        No records found for the selected subject.
      </p>
    )}
  </div>
);

};

export default StudentReport;
