import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
 
const AiAudioLearning = ({ doctorData }) => {
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [chapter, setChapter] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [audioSrc, setAudioSrc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const chatWindowRef = useRef(null);

 
  // Auto-scroll chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatLog]);

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

  setSessionLoading(true);

  try {
    const resImages = await axios.get(
      `${API_BASE}/chapter-images?class=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`
    );
    const selectedPages = resImages.data;

    if (!selectedPages.length) {
      setMessages((prev) => [
        ...prev,
        { text: "No images found for this chapter.", sender: "bot" },
      ]);
      return;
    }

    const response = await fetch(`${API_BASE}/start-session-ibne-sina-audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className,
        subject,
        chapter,
        pages: selectedPages,
        name: doctorData.name,
      }),
    });

    const data = await response.json();

    if (data.sessionId) {
      setSessionId(data.sessionId);

      const backendMessage = data.message || "Session initialized successfully.";
      setMessages((prev) => [...prev, { text: backendMessage, sender: "bot" }]);

      // ✅ New: handle audio URL
      if (data.audioUrl) {
        setAudioSrc(`${API_BASE}${data.audioUrl}`);
      }
    } else {
      throw new Error("No session ID returned from backend.");
    }
  } catch (error) {
    console.error("Error starting session:", error);
    setMessages((prev) => [
      ...prev,
      { text: "Failed to start session. Please try again.", sender: "bot" },
    ]);
  } finally {
    setSessionLoading(false);
  }
};

  
  // Refresh page
  const handleRefresh = () => {
   // Reset form inputs
   setSubject("");
   setMarks("");
   setQuestionText("");
 
   // Reset session and conversation states
   setSessionId(null);
   setChatLog([]);
   setMessages([]);
   setAudioSrc(null);
   setIsRecording(false);
   setIsStartingConversation(false);
 
   // Reset refs
   if (mediaRecorderRef.current) {
     mediaRecorderRef.current.stop?.();
     mediaRecorderRef.current = null;
   }
   audioChunksRef.current = [];
   if (audioRef.current) {
     audioRef.current.pause();
     audioRef.current.currentTime = 0;
     audioRef.current.src = "";
   }
 
   // Scroll chat window to top
   if (chatWindowRef.current) {
     chatWindowRef.current.scrollTop = 0;
   }
 
   console.log("[DEBUG] All inputs, chat, audio, and recording state cleared. Ready for a fresh session.");
 };


  // Start conversation
  

  // Voice recording
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = handleSendAudio;
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send recorded audio
  const handleSendAudio = async () => {
    if (!sessionId || !doctorData) {
      alert("Start a conversation first!");
      return;
    }

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("session_id", sessionId);
      formData.append("username", doctorData.name);
      formData.append("id", doctorData.id);

      console.log("🚀 Sending audio:", { size: audioBlob.size, type: audioBlob.type });

      const response = await fetch(
        "https://usefulapis-production.up.railway.app/send_audio_message",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.audio_url) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = data.audio_url;
        await audioRef.current.play();
      }

      if (data.reply) {
       setChatLog(prev => [
         ...prev,
         { sender: "bot", text: data.reply }
       ]);
     }


      console.log("📝 Transcription / response:", data);
    } catch (error) {
      console.error("❌ Error sending audio:", error);
      alert("Failed to send audio message.");
    }
  };

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
    <div
      style={{
        padding: 12,
        fontFamily: "Arial, sans-serif",
        width: "100%",
        minHeight: "90vh",
        background: "#f0f4f8",
      }}
    >
      {/* --- Controls --- */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-100 shadow z-10 w-full">
        {renderSelect(
          "Class",
          className,
          (val) => {
            setClassName(val);
            setSubject("");
            setChapter("");
          },
          classes
        )}
  
        {renderSelect(
          "Subject",
          subject,
          (val) => {
            setSubject(val);
            setChapter("");
          },
          subjects,
          !className
        )}
  
        {renderSelect("Chapter", chapter, setChapter, chapters, !subject)}
  
        <div className="flex items-end">
          <button
            onClick={startConversation}
            disabled={sessionLoading}
            className={`px-4 py-2 rounded-md font-medium ${
              sessionLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {sessionLoading ? "Wait..." : "Start Conversation"}
          </button>
        </div>
      </div>
  
      {/* --- Chat Window --- */}
      <div
        ref={chatWindowRef}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 15,
          height: 200,
          overflowY: "auto",
          marginBottom: 20,
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {chatLog.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 10,
              textAlign: msg.sender === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 10,
                background: msg.sender === "user" ? "#DCF8C6" : "#E3F2FD",
                color: "#333",
                maxWidth: "70%",
                wordWrap: "break-word",
              }}
            >
              {msg.sender === "user" ? "🧑 " : "🤖 "} {msg.text}
            </span>
          </div>
        ))}
      </div>
  
      {/* --- Voice Assistant --- */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: 20, fontWeight: 600 }}>Talk to AI Tutor</div>
  
        {/* Record button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            background: isRecording ? "#F44336" : "#007BFF",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            position: "relative",
            outline: "none",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "#fff",
              borderRadius: "50%",
              margin: "0 auto",
              marginTop: 30,
            }}
          />
          {isRecording && (
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "-10px",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid #F44336",
                animation: "pulse 1s infinite",
              }}
            />
          )}
        </button>
  
        {/* Audio player */}
        <audio
          ref={audioRef}
          controls
          autoPlay   // 👈 auto-play audio when src changes
          src={audioSrc || ""}
          style={{
            display: "block",
            margin: "16px auto 0",
            width: "100%",
            maxWidth: 320,
            borderRadius: 8,
          }}
        />
      </div>
  
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0.4; }
            100% { transform: scale(1); opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );

};

export default AiAudioLearning;
