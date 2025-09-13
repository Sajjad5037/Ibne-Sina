import { useState, useEffect } from "react";

export default function ChatbotTrainerUI() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [className, setClassName] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🔹 Fetch the image map JSON from your GCS bucket on mount
  useEffect(() => {
    const fetchImageMap = async () => {
      try {
        const res = await fetch(
          "https://storage.googleapis.com/my-edu-bucket/imageMap.json"
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

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate tutor reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: `You said: "${newMessage.text}"`, sender: "bot" },
      ]);
    }, 500);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading syllabus data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Controls */}
      <div className="flex items-end gap-4 p-4 bg-gray-100 shadow z-10">
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
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-gray-50 flex flex-col">
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
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
