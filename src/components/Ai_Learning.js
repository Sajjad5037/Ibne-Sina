import { useState, useEffect } from "react";

const ChatbotTrainerUI = ({ doctorData }) => {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // 🔹 Fetch the latest image map
  useEffect(() => {
    const fetchImageMap = async () => {
      try {
        const res = await fetch(
          "https://storage.googleapis.com/ibne_sina_app/imageMap1.json"
        );
        const data = await res.json();
        setImageMap(data);
      } catch (err) {
        console.error("Failed to load imageMap1.json", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImageMap();
  }, []);

  // 🔹 Start training session
  const startConversation = async () => {
    if (!className || !subject || !chapter) {
      alert("Please select class, subject, and chapter first.");
      return;
    }

    const selectedPages = imageMap[className]?.[subject]?.[chapter] || [];

    if (!selectedPages.length) {
      alert("No pages found for this selection.");
      return;
    }

    setMessages([
      {
        text: `Training session started for ${subject} > ${chapter} > ${className}.`,
        sender: "bot",
      },
      {
        text: `Found ${selectedPages.length} reference pages. Sending them to the backend...`,
        sender: "bot",
      },
    ]);

    try {
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/start-session-ibne-sina",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            chapter,
            className,
            pages: selectedPages, // ✅ full GCS URLs
            name: doctorData.name,
          }),
        }
      );

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
      const response = await fetch(
        "https://usefulapis-production.up.railway.app/chat_interactive_tutor_Ibne_Sina",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            username: doctorData?.name || "Guest",
            message: input,
            first_message: messages.length === 0,
          }),
        }
      );

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
            {renderSelect(
              "Class",
              className,
              (val) => {
                setClassName(val);
                setSubject("");
                setChapter("");
              },
              Object.keys(imageMap)
            )}
            {renderSelect(
              "Subject",
              subject,
              (val) => {
                setSubject(val);
                setChapter("");
              },
              className ? Object.keys(imageMap[className]) : [],
              !className
            )}
            {renderSelect(
              "Chapter",
              chapter,
              setChapter,
              className && subject ? Object.keys(imageMap[className][subject]) : [],
              !subject
            )}
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
            
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 w-full">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center w-full">
                  Start the conversation with your tutor...
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`w-full px-4 py-2 rounded-lg max-w-full ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white self-end"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  {msg.text}
                </div>
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
