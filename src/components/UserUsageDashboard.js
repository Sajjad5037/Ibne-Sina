// StudentUsageReport.js
import React, { useEffect, useState } from "react";

const StudentUsageReport = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minUsage, setMinUsage] = useState(0);
  const [maxUsage, setMaxUsage] = useState(1000);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://usefulapis-production.up.railway.app/users_total_usage?min_usage=${minUsage}&max_usage=${maxUsage}`
        );

        if (!response.ok) throw new Error("Failed to fetch user usage data");

        const data = await response.json();

        // Backend returns an array directly
        setUsers(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch usage. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [minUsage, maxUsage]);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Student API Usage Report</h2>

      {/* Filter Inputs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          Min Usage (USD)
          <input
            type="number"
            value={minUsage}
            onChange={(e) => setMinUsage(Number(e.target.value))}
            placeholder="0"
            style={{ padding: "8px", marginTop: "4px" }}
          />
        </label>

        <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          Max Usage (USD)
          <input
            type="number"
            value={maxUsage}
            onChange={(e) => setMaxUsage(Number(e.target.value))}
            placeholder="5"
            style={{ padding: "8px", marginTop: "4px" }}
          />
        </label>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading data...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a", color: "#fff" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Username</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Total Tokens</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Total Usage (USD)</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: "10px", textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.username} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>{user.username}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>{user.total_tokens}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>{user.total_usage_usd.toFixed(4)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentUsageReport;
