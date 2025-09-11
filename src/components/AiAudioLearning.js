import React, { useState, useEffect, useRef } from "react";
 
const AiAudioLearning = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [audioSrc, setAudioSrc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Reset question when marks change
  useEffect(() => setQuestionText(""), [marks]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatLog]);

  const questionsByMarks = {
    4: [
      "Explain two features of a laboratory experiment and how they are used to test hypotheses in sociology.",
      "Describe two types of qualitative interview.",
      "Describe two ways children learn about gender identity.",
      "Describe two ways increased life expectancy may impact upon the family.",
      "Describe two ways social policies may impact upon the family.",
      "Describe two ways childhood is a distinct period from adulthood.",
      "Describe two ways schools can be seen as feminised.",
    ],
    6: [
      "Explain two strengths of using unstructured interviews in sociological research.",
      "Using sociological material, give one argument against the view that the peer group is the most important influence in shaping age identity.",
      "Explain two strengths of using content analysis in sociological research.",
      "‘Education is the most important influence in shaping class identity.’ Using sociological material, give one argument against this view.",
      "Explain two strengths of using laboratory experiments in sociological research.",
      "‘Inadequate socialisation is the main cause of deviant behaviour.’",
      "Explain one strength and one limitation of liberal feminist views of the family.",
      "‘Social class is the most important factor affecting the experiences of children in the family.’ Using sociological material, give one argument against this view.",
      "Explain one strength and one limitation of postmodernist views on family diversity.",
      "Explain two strengths of functionalist views of the family.",
    ],
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
  const handleStartConversation = async () => {
  // Validate required fields
  if (!subject || !marks || !questionText) {
    alert("⚠️ Please fill in all fields before starting the conversation.");
    return;
  }

  try {
    setIsStartingConversation(true); // show "Starting..." on button

    const payload = {
      subject,
      marks,
      question_text: questionText,
      username: doctorData?.name || "Guest",
    };

    console.log("[DEBUG] Starting conversation with payload:", payload);

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/chat_anz_way_model_evaluation_audio",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

    const data = await response.json();
    console.log("[DEBUG] Conversation started, backend response:", data);

    // Save session ID
    if (data.session_id) setSessionId(data.session_id);

    // Add initial bot text reply
    if (data.text_reply) {
      setChatLog((prev) => [...prev, { sender: "bot", text: data.text_reply }]);
    }

    // Poll for audio if session exists
    if (data.session_id) {
      const interval = setInterval(async () => {
        try {
          const audioRes = await fetch(
            `https://usefulapis-production.up.railway.app/get-audio/${data.session_id}`
          );

          if (!audioRes.ok) throw new Error(`Audio fetch error: ${audioRes.statusText}`);
          const audioData = await audioRes.json();

          if (audioData.audio_ready && audioData.audio_base64) {
            clearInterval(interval);

            const src = `data:audio/mp3;base64,${audioData.audio_base64}`;
            setAudioSrc(src);

            if (audioRef.current && audioRef.current.src !== src) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              audioRef.current.src = src;
              audioRef.current.play().catch((e) => console.error("⚠️ Audio play error:", e));
            }
          }
        } catch (err) {
          console.error("❌ Error fetching audio:", err);
          clearInterval(interval);
        }
      }, 2000);
    }
  } catch (error) {
    console.error("❌ Error starting conversation:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsStartingConversation(false); // reset button state
  }
};


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
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 15, marginBottom: 20 }}>
        {/* Subject */}
        <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: 600, marginBottom: 5 }}>Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
          >
            <option value="">-- Select Subject --</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
            <option value="history">History</option>
            <option value="political_science">Political Science</option>
            <option value="literature">Literature</option>
          </select>
        </div>

        {/* Marks */}
        <div style={{ flex: "0 0 90px", display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: 600, marginBottom: 5 }}>Marks</label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc", textAlign: "center" }}
          />
        </div>

        {/* Question */}
        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: 600, marginBottom: 5 }}>Question</label>
          <select
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}
          >
            <option value="">-- Select a question --</option>
            {questionsByMarks[marks]?.map((q, idx) => (
              <option key={idx} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <button
           onClick={handleStartConversation}
           disabled={isStartingConversation} // track loading state
           style={{
             padding: "10px 16px",
             borderRadius: 8,
             border: "none",
             background: isStartingConversation ? "#007bff" : "#4CAF50", // optional color change
             color: "#fff",
             fontWeight: 600,
             cursor: isStartingConversation ? "not-allowed" : "pointer",
           }}
         >
           {isStartingConversation ? "Starting..." : "Start"}
         </button>
          <button
            onClick={handleRefresh}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#2196F3",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Chat Window */}
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
            style={{ marginBottom: 10, textAlign: msg.sender === "user" ? "right" : "left" }}
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

      {/* Voice Assistant */}
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
          <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", margin: "0 auto", marginTop: 30 }} />
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
        <audio
         ref={audioRef}
         controls
         src={audioSrc || ""}
         style={{
           display: "block",
           margin: "16px auto 0",
           width: "100%",
           maxWidth: 320,               // reduced from 400
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
