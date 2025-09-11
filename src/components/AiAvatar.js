import React from "react";
import { Sparkles } from "lucide-react"; // make sure you have: npm install lucide-react

const AiAvatar = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        margin: "20px 0",
        border: "2px dashed #aaa",
        borderRadius: "12px",
        background: "#f9f9f9",
        fontFamily: "sans-serif",
      }}
    >
      <Sparkles style={{ marginRight: "8px", color: "#6c63ff" }} />
      <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>
        Avatar AI Tutor –{" "}
        <span style={{ color: "#6c63ff" }}>Coming Soon</span> 🚀
      </span>
    </div>
  );
};

export default AiAvatar;
