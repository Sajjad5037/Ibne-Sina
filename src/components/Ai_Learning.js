import { useState, useEffect } from "react";

const ChatbotTrainerUI = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [className, setClassName] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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

  const handleTrain = () => {
    if (!subject || !chapter || !className) {
      alert("Please select subject, chapter, and class first.");
      return;
    }
  
    // Get the selected image URLs from the imageMap
    const selectedPages = imageMap[subject]?.[chapter]?.[className] || [];
  
    if (selectedPages.length === 0) {
      alert("No pages found for this selection.");
      return;
    }
  
    // Reset chat and begin conversation
    setMessages([
      {
        text: `Training session started for ${subject} > ${chapter} > ${className}.`,
        sender: "bot",
      },
      {
        text: `Found ${selectedPages.length} reference pages. You can now ask questions based on this material.`,
        sender: "bot",
      },
    ]);
  
    // ⚡ Optional: If you want to store the selected pages in state for later use
    // setSelectedPages(selectedPages);
  };

  const handleSendMessage = async () => {
  if (!userInput.trim()) return;

  if (!sessionId) {
    alert("Please start training first to get a session ID.");
    return;
  }

  try {
    setIsSending(true); // show loading state while sending

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/chat_interactive_tutor_Ibe_Sina",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          username: doctorData.name, // pass user’s name
          message: userInput,
          first_message: chatLog.length === 0, // flag if this is the first message
        }),
      }
    );

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    // Append both user and bot messages to chatLog
    setChatLog((prev) => [
      ...prev,
      { type: "user", message: userInput },
      { type: "bot", message: data.reply }, // reply is HTML-formatted text from API
    ]);

    setUserInput(""); // clear the input box
  } catch (error) {
    console.error("Message send failed:", error);
    alert("Failed to get a response from the tutor.");
  } finally {
    setIsSending(false); // reset loading state
  }
};


  return (
    <div className="h-screen flex flex-col items-center bg-gray-50">
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto shadow bg-white">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-100 shadow z-10">
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
          <div className="flex items-end">
            <button
              onClick={() => {
                if (subject && chapter && className) {
                  setMessages([
                    {
                      text: `Conversation started for ${subject} > ${chapter} > ${className}`,
                      sender: "bot",
                    },
                  ]);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Start Conversation
            </button>
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

          <div className="p-4 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatbotTrainerUI;
