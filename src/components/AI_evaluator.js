import React, { useEffect, useState } from "react";

const AI_evaluator = ({ doctorData }) => {
  const [pdfOptions, setPdfOptions] = useState([]);
  const [questionOptions, setQuestionOptions] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [inputMode, setInputMode] = useState("text"); // "text" or "image"
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  // Fetch dropdown data from backend
  useEffect(() => {
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
    console.log("Evaluating:", selectedPdf, selectedQuestion, inputMode);

    const formData = new FormData();
    formData.append("pdf", selectedPdf);
    formData.append("question", selectedQuestion);

    if (inputMode === "image" && uploadedImage) {
      formData.append("image", uploadedImage);
    } else if (inputMode === "text" && userInput.trim()) {
      formData.append("text", userInput);
    }

    fetch("http://localhost:5000/api/evaluate", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => console.log("Evaluation result:", data))
      .catch((err) => console.error("Error evaluating:", err));
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length > 0) {
      setUploadedImage(e.target.files[0]);
      setUserInput(""); // clear text if switching to image
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-md space-y-6">
      {/* Input Mode Selector */}
      <div className="flex gap-6 mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="radio"
            name="inputMode"
            value="text"
            checked={inputMode === "text"}
            onChange={() => {
              setInputMode("text");
              setUploadedImage(null);
            }}
          />
          Write Text
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="radio"
            name="inputMode"
            value="image"
            checked={inputMode === "image"}
            onChange={() => {
              setInputMode("image");
              setUserInput("");
            }}
          />
          Upload Image
        </label>
      </div>

      {/* Conditionally Render Input */}
      {inputMode === "text" ? (
        <textarea
          className="w-full p-2 border rounded-lg mb-4"
          rows="4"
          placeholder="Type your answer here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      ) : (
        <div className="flex flex-col mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
          {uploadedImage && (
            <p className="text-xs text-gray-600 mt-1">
              Selected: {uploadedImage.name}
            </p>
          )}
        </div>
      )}

      {/* Row with PDF, Question, Evaluate */}
      <div className="flex items-end gap-6">
        {/* PDF Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            PDF name
          </label>
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
          <label className="text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
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
    </div>
  );
};

export default AI_evaluator;
