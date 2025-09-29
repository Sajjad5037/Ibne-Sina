import React, { useEffect, useState } from "react";

const AI_evaluator = ({ doctorData }) => {
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [pdfOptions, setPdfOptions] = useState([]);
  const [questionOptions, setQuestionOptions] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const [inputMode, setInputMode] = useState("text"); // "text" or "image"
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [chatLog, setChatLog] = useState([]); // Q/A session history

  // Fetch dropdown data from backend
  useEffect(() => {
    fetch("https://usefulapis-production.up.railway.app/api/form-data-ibne-sina")
      .then((res) => res.json())
      .then((data) => {
        setSubjectOptions(data.subjects || []);
        setPdfOptions(data.pdfs || []);
        setQuestionOptions(data.questions || []);
      })
      .catch((err) => console.error("Error fetching form data:", err));
  }, []);

  const handleFinish = async () => {
    // --- Debug log to check doctorData ---
    console.log("[DEBUG] doctorData:", doctorData);
    console.log("[DEBUG] student_id:", doctorData?.id);
    console.log("[DEBUG] student_name:", doctorData?.name);
  
    // --- Prepare payload ---
    const payload = {
      subject: selectedSubject,
      student_id: doctorData?.id,       // student id
      student_name: doctorData?.name,   // student name
      pdf: selectedPdf,
      preparedness: "Well prepared"     // send this to backend
    };
  
    try {
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/api/finish_session_ibne_sina",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error finishing session:", errorData);
        alert(errorData.detail || "Failed to finish session.");
        return;
      }
  
      const data = await response.json();
  
      // --- Show confirmation ---
      alert(data.message || "Session successfully saved!");
      // Optionally, reset states
      setChatLog([]);
      setSelectedSubject("");
      setSelectedPdf("");
      setSelectedQuestion("");
      setQuestionOptions([]);
    } catch (err) {
      console.error("Error finishing session:", err);
      alert("Failed to finish session. Please try again.");
    }
  };

  
  const handleEvaluate = async () => {
    // --- Step 1: Validate selections ---
    if (!selectedSubject || !selectedPdf || !selectedQuestion) {
      alert("Please select a subject, PDF, and question first.");
      return;
    }
  
    // --- Step 2: Prepare FormData ---
    const formData = new FormData();
    formData.append("subject", selectedSubject);
    formData.append("pdf", selectedPdf);
    formData.append("question", selectedQuestion);
  
    let studentAnswer = "";
  
    if (inputMode === "image" && uploadedImage) {
      formData.append("image", uploadedImage);
      studentAnswer = `[Image: ${uploadedImage.name}]`;
    } else if (inputMode === "text" && userInput.trim()) {
      formData.append("text", userInput);
      studentAnswer = userInput;
    } else {
      alert("Please provide an answer before evaluating.");
      return;
    }
  
    // --- Step 3: Add student's answer to chat log ---
    setChatLog((prev) => [...prev, { sender: "student", message: studentAnswer }]);
  
    // --- Step 4: Send request to backend ---
    try {
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/api/evaluate_ibne_sina",
        { method: "POST", body: formData }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error evaluating:", errorData);
        alert(errorData.detail || "Error evaluating the answer.");
        return;
      }
  
      const data = await response.json();
  
      // --- Step 5: Update chat log with AI evaluation ---
      setChatLog((prev) => [
        ...prev,
        { sender: "ai", message: `✅ Student Answer: ${data.student_answer}` },
        { sender: "ai", message: `📘 Correct Answer: ${data.correct_answer}` },
        { sender: "ai", message: `📝 Feedback: ${data.evaluation}` },
      ]);
  
      // --- Step 6: Remove question if student passed ---
      if (data.passed) {
        setQuestionOptions((prev) =>
          prev.filter((q) => q !== selectedQuestion)
        );
        setSelectedQuestion(""); // reset selection
      }

  
    } catch (err) {
      console.error("Error evaluating:", err);
      alert("Failed to evaluate the answer. Please try again.");
    }
  
    // --- Step 7: Reset input fields ---
    setUserInput("");
    setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length > 0) {
      setUploadedImage(e.target.files[0]);
      setUserInput(""); // clear text if switching to image
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-md space-y-6">
      {/* Row with Subject, PDF and Question */}
      <div className="flex items-end gap-6">
        {/* Subject */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subject</option>
            {subjectOptions.map((subj, idx) => (
              <option key={idx} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

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
            {pdfOptions.map((pdf, idx) => {
              // Extract file name from URL
              let fileName = pdf.split("/").pop();   // page_5.png
              fileName = fileName.split(".")[0];     // page_5
              return (
                <option key={idx} value={pdf}>
                  {fileName}
                </option>
              );
            })}
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
      </div>

      {/* Chat Window */}
      <div className="border rounded-lg bg-white p-4 h-64 overflow-y-auto shadow-inner">
        {chatLog.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">
            No evaluations yet. Submit your answer to begin.
          </p>
        ) : (
          chatLog.map((entry, idx) => (
            <div
              key={idx}
              className={`mb-3 ${
                entry.sender === "student" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                  entry.sender === "student"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Mode Selector */}
      <div className="flex gap-6">
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
          className="w-full p-2 border rounded-lg"
          rows="3"
          placeholder="Type your answer here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      ) : (
        <div className="flex flex-col">
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

      {/* Evaluate Button */}
      <button
        onClick={handleEvaluate}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow"
      >
        Submit Answer
      </button>
      <button
        onClick={handleFinish} // your finish logic
        disabled={false} // enabled only when all questions cleared
        className={`px-4 py-2 rounded-lg font-medium shadow ${
          questionOptions.length > 0
            ? "bg-gray-300 text-gray-600 cursor-not-allowed" // disabled style
            : "bg-green-600 hover:bg-green-700 text-white" // enabled style
        }`}
      >
        Finish
      </button>    
    </div>
  );
};

export default AI_evaluator;
