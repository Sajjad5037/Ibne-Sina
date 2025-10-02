import React, { useEffect, useState } from "react";

const AI_evaluator = ({ doctorData }) => {
  const [subjects, setSubjects] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [questionOptions, setQuestionOptions] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPdf, setSelectedPdf] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const [inputMode, setInputMode] = useState("text"); // "text" or "image"
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [chatLog, setChatLog] = useState([]);

  // --- Fetch subjects on mount ---
  useEffect(() => {
    fetch("https://usefulapis-production.up.railway.app/distinct_subjects_ibne_sina")
      .then((res) => res.json())
      .then((data) => {
        const subjectsArray = Array.isArray(data)
          ? data
          : data.subjects || [];
        const mappedSubjects = subjectsArray.map((s) => ({
          label: String(s),
          value: String(s),
        }));
        setSubjects(mappedSubjects);
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  }, []);

  // --- Fetch PDFs when subject changes ---
  useEffect(() => {
    if (!selectedSubject) {
      setPdfs([]);
      setSelectedPdf("");
      return;
    }

    fetch(`https://usefulapis-production.up.railway.app/distinct_pdfs_ibne_sina?subject=${encodeURIComponent(selectedSubject)}`)
      .then((res) => res.json())
      .then((data) => {
        const urls = data.pdfs || data || [];
        const mappedPdfs = urls.map((url) => {
          const fullName = url.split("/").pop();
          const shortName = fullName.split("_").slice(-2).join("_");
          return {
            label: String(shortName),
            value: String(fullName),
          };
        });
        setPdfs(mappedPdfs);
      })
      .catch((err) => console.error("Error fetching PDFs:", err));
  }, [selectedSubject]);

  // --- Fetch questions when PDF changes ---
  useEffect(() => {
    if (!selectedPdf) {
      setQuestionOptions([]);
      return;
    }

    fetch(`https://usefulapis-production.up.railway.app/questions_by_pdf_ibne_sina?pdf_name=${encodeURIComponent(selectedPdf)}`)
      .then((res) => res.json())
      .then((data) => {
        const questions = Array.isArray(data) ? data : [];
        setQuestionOptions(questions.map((q) => String(q)));
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setQuestionOptions([]);
      });
  }, [selectedPdf]);

  const handleFinish = async () => {
    const payload = {
      subject: selectedSubject,
      student_id: String(doctorData?.id),
      student_name: doctorData?.name,
      pdf: selectedPdf,
      preparedness: "Well prepared",
    };

    try {
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/api/finish_session_ibne_sina",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to finish session.");
        return;
      }

      const data = await response.json();
      alert(data.message || "Session successfully saved!");
      // Reset states
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
    if (!selectedSubject || !selectedPdf || !selectedQuestion) {
      alert("Please select a subject, PDF, and question first.");
      return;
    }

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

    setChatLog((prev) => [...prev, { sender: "student", message: studentAnswer }]);

    try {
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/api/evaluate_ibne_sina",
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Error evaluating the answer.");
        return;
      }

      const data = await response.json();
      setChatLog((prev) => [
        ...prev,
        { sender: "ai", message: `✅ Student Answer: ${data.student_answer}` },
        { sender: "ai", message: `📘 Correct Answer: ${data.correct_answer}` },
        { sender: "ai", message: `📝 Feedback: ${data.evaluation}` },
      ]);

      if (data.passed) {
        setQuestionOptions((prevOptions) =>
          prevOptions.filter((q) => q.trim() !== selectedQuestion.trim())
        );
      }
    } catch (err) {
      console.error("Error evaluating:", err);
      alert("Failed to evaluate the answer. Please try again.");
    }

    setUserInput("");
    setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length > 0) {
      setUploadedImage(e.target.files[0]);
      setUserInput("");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl shadow-md space-y-6">
      {/* Dropdown Row */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Subject */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj.value}>
                {subj.label}
              </option>
            ))}
          </select>
        </div>

        {/* PDF */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">PDF name</label>
          <select
            value={selectedPdf}
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedSubject}
          >
            <option value="">Select PDF</option>
            {pdfs.map((pdf) => (
              <option key={pdf.value} value={pdf.value}>
                {pdf.label}
              </option>
            ))}
          </select>
        </div>

        {/* Question */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Question Text</label>
          <select
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedPdf}
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
              className={`mb-3 ${entry.sender === "student" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                  entry.sender === "student" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Mode */}
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

      {/* Input Area */}
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
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {uploadedImage && <p className="text-xs text-gray-600 mt-1">Selected: {uploadedImage.name}</p>}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleEvaluate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow"
        >
          Submit Answer
        </button>
        <button
          onClick={handleFinish}
          disabled={questionOptions.length > 0}
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            questionOptions.length > 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default AI_evaluator;
