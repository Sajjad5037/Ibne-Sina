import { useState, useEffect } from "react";
import axios from "axios";

const ChatbotTrainerUI = ({ doctorData }) => {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const API_BASE = "https://usefulapis-production.up.railway.app";

  // 🔹 Fetch classes on load
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/classes`);
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // 🔹 Fetch subjects whenever class changes
  useEffect(() => {
    if (!className) return setSubjects([]);
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/subjects?class=${encodeURIComponent(className)}`
        );
        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [className]);

  // 🔹 Fetch chapters whenever class or subject changes
  useEffect(() => {
    if (!className || !subject) return setChapters([]);
    const fetchChapters = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/chapters?class=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}`
        );
        setChapters(res.data);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setChapters([]);
      }
    };
    fetchChapters();
  }, [className, subject]);

  // 🔹 Start training session
  const startConversation = async () => {
    if (!className || !subject || !chapter) {
      alert("Please select class, subject, and chapter first.");
      return;
    }
  
    setMessages([
      {
        text: `Training session started for ${subject} > ${chapter} > ${className}.`,
        sender: "bot",
      },
    ]);
  
    try {
      // 🔹 Fetch the chapter images first
      const resImages = await axios.get(
        `${API_BASE}/chapter-images?class=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`
      );
      const selectedPages = resImages.data; // array of image URLs
  
      if (!selectedPages.length) {
        setMessages((prev) => [
          ...prev,
          { text: "No images found for this chapter.", sender: "bot" },
        ]);
        return;
      }
  
      // 🔹 Start training session with images
      const response = await fetch(`${API_BASE}/start-session-ibne-sina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className,
          subject,
          chapter,
          pages: selectedPages, // send images here
          name: doctorData.name,
        }),
      });
  
      const data = await response.json();
  
      if (data.sessionId) {
        setSessionId(data.sessionId);
        const backendMessage = data.message || "Session initialized successfully.";
        setMessages((prev) => [...prev, { text: backendMessage, sender: "bot" }]);
      } else {
        throw new Error("No session ID returned from backend.");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Failed to start session. Please try again.", sender: "bot" },
      ]);
    }
  };


  // 🔹 Send message to the tutor
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!sessionId) {
      alert("Please start training first to get a session ID.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/chat_interactive_tutor_Ibne_Sina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          username: doctorData?.name || "Guest",
          message: input,
          first_message: messages.length === 0,
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        { text: data.reply, sender: "bot" },
      ]);
      setInput("");
    } catch (error) {
      console.error("Message send failed:", error);
      alert("Failed to get a response from the tutor.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading syllabus data...</p>
      </div>
    );
  }

  const renderSelect = (label, value, setValue, options, disabled = false) => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2"
        disabled={disabled}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-2">
      <div className="flex flex-col h-full w-full shadow bg-white rounded-lg overflow-hidden">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-100 shadow z-10 w-full">
          {renderSelect("Class", className, (val) => { setClassName(val); setSubject(""); setChapter(""); }, classes)}
          {renderSelect("Subject", subject, (val) => { setSubject(val); setChapter(""); }, subjects, !className)}
          {renderSelect("Chapter", chapter, setChapter, chapters, !subject)}
          <div className="flex items-end">
            <button
              onClick={startConversation}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Start Conversation
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 w-full max-h-[70vh]">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center w-full">
                Start the conversation with your tutor...
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`w-full px-4 py-2 rounded-lg max-w-full break-words ${
                  msg.sender === "user" ? "bg-blue-600 text-white self-end" : "bg-gray-200 text-gray-800 self-start"
                }`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t flex gap-2 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 w-full"
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotTrainerUI;
