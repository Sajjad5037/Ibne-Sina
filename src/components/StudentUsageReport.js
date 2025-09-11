import React, { useEffect, useState } from "react";

const StudentUsageReport = ({ doctorData }) => {
  const [usage, setUsage] = useState(0); // total usage in USD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const HARD_LIMIT_USD = 0.4; // hard-coded usage limit
  const usdToPkr = 280; // conversion rate

  useEffect(() => {
    const fetchUsage = async () => {
      if (!doctorData?.id) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://usefulapis-production.up.railway.app/student_total_usage",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_name: doctorData.name }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch usage");

        const data = await response.json();
        setUsage(data.total_usage_usd || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch usage. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [doctorData]);

  const usagePercent = Math.min((usage / HARD_LIMIT_USD) * 100, 100);

  // Dynamic color based on usage
  let barColor = "#1e3a8a"; // default blue
  if (usagePercent >= 100) barColor = "#b91c1c"; // red
  else if (usagePercent >= 75) barColor = "#f97316"; // orange

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Student Usage
      </h2>

      {loading && <p style={{ textAlign: "center" }}>Loading usage...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ width: "100%" }}>
          {/* Usage bar background */}
          <div
            style={{
              width: "100%",
              height: "30px",
              backgroundColor: "#e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            {/* Filled portion */}
            <div
              style={{
                width: `${usagePercent}%`,
                height: "100%",
                backgroundColor: barColor,
                transition: "width 0.5s ease, background-color 0.5s ease",
              }}
            />
          </div>

          <p style={{ textAlign: "center", margin: 0, fontSize: "16px" }}>
            {`Usage: ${usagePercent.toFixed(1)}% of allowed limit`}
          </p>
          
        </div>
      )}
    </div>
  );
};

export default StudentUsageReport;
