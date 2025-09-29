import React, { useEffect, useState } from "react";

const AI_evaluator = ({ doctorData }) => {
  const [pdfOptions, setPdfOptions] = useState([]);
  const [questionOptions, setQuestionOptions] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");

  // Fetch dropdown data from backend
  useEffect(() => {
    // Example API endpoints
    fetch("http://localhost:5000/api/pdfs")
      .then((res) => res.json())
      .then((data) => setPdfOptions(data))
      .catch((err) => console.error("Error fetching PDFs:", err));

    fetch("http://localhost:5000/api/questions")
      .then((res) => res.json())
      .then((data) => setQuestionOptions(data))
      .catch((err) => console.error("Error fetching Questions:", err));
  }, []);

  const handleEvaluate = () => {
    console.log("Evaluating:", selectedPdf, selectedQuestion);
    // You can POST these to backend for evaluation
    fetch("http://localhost:5000/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf: selectedPdf, question: selectedQuestion }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Evaluation result:", data))
      .catch((err) => console.error("Error evaluating:", err));
  };

  return (
    <div className="flex items-end gap-6 p-6 bg-gray-100 rounded-xl shadow-md">
      {/* PDF Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">PDF name</label>
        <select
          value={selectedPdf}
          onChange={(e) => setSelectedPdf(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select PDF</option>
          {pdfOptions.map((pdf, idx) => (
            <option key={idx} value={pdf}>
              {pdf}
            </option>
          ))}
        </select>
      </div>

      {/* Question Text */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Question Text</label>
        <select
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Question</option>
          {questionOptions.map((q, idx) => (
            <option key={idx} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {/* Evaluate Button */}
      <button
        onClick={handleEvaluate}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow"
        disabled={!selectedPdf || !selectedQuestion}
      >
        Evaluate
      </button>
    </div>
  );
};

export default AI_evaluator;
