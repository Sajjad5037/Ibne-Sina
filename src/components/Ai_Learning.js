import { useState, useEffect } from "react";

const ChatbotTrainerUI = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [className, setClassName] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch syllabus/image map
  useEffect(() => {
    const fetchImageMap = async () => {
      try {
        const res = await fetch(
          "https://storage.googleapis.com/ibne_sina_app/imageMap.json"
        );
        const data = await res.json();
        setImageMap(data);
      } catch (err) {
        console.error("Failed to load imageMap.json", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImageMap();
  }, []);

  // Start conversation / training
  
  const startConversation = async () => {
  if (!subject || !chapter || !className) {
    alert("Please select subject, chapter, and class first.");
    return;
  }

  const selectedPages = imageMap[subject]?.[chapter]?.[className] || [];
  if (selectedPages.length === 0) {
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
    // Send selected images/pages to backend
    const response = await fetch("https://usefulapis-production.up.railway.app/start-session-ibne-sina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        chapter,
        className,
        pages: selectedPages,
        doctorData: JSON.stringify({ name: doctorData.name }) // <-- added username
      }),
    });

    const data = await response.json();

    if (data.sessionId) {
      setSessionId(data.sessionId);

      // Use backend message instead of hardcoded text
      const backendMessage = data.message || "Session initialized successfully.";

      setMessages(prev => [
        ...prev,
        {
          text: backendMessage,
          sender: "bot",
        },
      ]);
    } else {
      throw new Error("No session ID returned from backend.");
    }
  } catch (error) {
    console.error("Error starting session:", error);
    setMessages(prev => [
      ...prev,
      {
        text: "Failed to start session. Please try again.",
        sender: "bot",
      },
    ]);
  }
};


  // Send a message to the tutor API
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!sessionId) {
      alert("Please start training first to get a session ID.");
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(
        "https://usefulapis-production.up.railway.app/chat_interactive_tutor_Ibe_Sina",
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

  return (
    <div className="h-screen flex flex-col items-center bg-gray-50">
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto shadow bg-white">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-100 shadow z-10">
          {/* Subject */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Subject:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select subject</option>
              {Object.keys(imageMap).map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Chapter:</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              disabled={!subject}
            >
              <option value="">Select chapter</option>
              {subject &&
                Object.keys(imageMap[subject] || {}).map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
            </select>
          </div>

          {/* Class */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Class:</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
              disabled={!chapter}
            >
              <option value="">Select class</option>
              {chapter &&
                Object.keys(imageMap[subject]?.[chapter] || {}).map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
            </select>
          </div>

          {/* Start Conversation Button */}
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
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center">
                Start the conversation with your tutor...
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
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
