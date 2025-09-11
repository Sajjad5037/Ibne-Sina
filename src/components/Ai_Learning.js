import React, { useState, useEffect } from "react";
import { marked } from "marked";


const Ai_Learning = ({ doctorData }) => {
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [question_text, setQuestionText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const isDisabled = !doctorData || doctorData.id == null || !sessionId;
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);



  useEffect(() => {
    setQuestionText("");
  }, [marks]);



  const questionsByMarks = {
  4: [
    "Explain two features of a laboratory experiment and how they are used to test hypotheses in sociology.",
    "Describe two types of qualitative interview.",
    "Describe two ways children learn about gender identity.",
    "Describe two ways increased life expectancy may impact upon the family.",
    "Describe two ways social policies may impact upon the family.",
    "Describe two ways childhood is a distinct period from adulthood.",
    "Describe two ways schools can be seen as feminised."
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
    "Explain two strengths of functionalist views of the family."
  ],
  8: [
    "Explain two reasons why some social groups are difficult to study.",
    "Explain two ethical factors to consider when conducting observational studies.",
    "Explain two reasons why unstructured interviews are high in validity.",
    "Explain two reasons for greater gender equality in some families.",
    "Explain two reasons why fewer people are getting married.",
    "Explain two functions the family performs to benefit its members.",
    "Explain two ways racism can affect attainment in schools."
  ],
  10: [
    "The peer group is the most important influence in shaping age identity. Explain this view.",
    "‘Education is the most important influence in shaping class identity.’ Explain this view.",
    "‘Inadequate socialisation is the main cause of deviant behaviour.’",
    "‘Social class is the most important factor affecting the experiences of children in the family.’ Explain this view.",
    "‘The main role of the family is to benefit society.’ Explain this view.",
    "‘There is no longer any social pressure on people to get married.’ Explain this view."
  ],
  12: [
    "IQ tests are a fair measure of educational ability. Using sociological material, give two arguments against this view."
  ],
  26: [
    "Evaluate the view that female identity is very different from fifty years ago.",
    "Evaluate the use of structured interviews in sociological research.",
    "Evaluate the view that human behaviour is shaped by nurture rather than nature.",
    "Evaluate the positivist view that sociologists should use a scientific approach to research.",
    "Evaluate the view that the family is the most important agent of socialisation in shaping identity.",
    "Evaluate the view that sociological research can be value-free.",
    "Evaluate the view that the main role of the family is to promote capitalist ideology.",
    "Evaluate the view that marriage has become less important in society.",
    "Evaluate the view that roles in the family are still based on traditional gender identities.",
    "Evaluate the view that the nuclear family is the dominant family type.",
    "Evaluate the view that cultural differences are the main cause of family diversity.",
    "Evaluate the view that parenthood today is different from the past.",
    "Evaluate the view that education contributes to value consensus."
  ]
};

  const handleRefresh = () => {
    // Reset all input fields and chat state
    setSubject("");
    setMarks("");
    setQuestionText("");
    setUserInput("");
    setChatLog([]);
    setSessionId(null);           // clears the current session
    setIsStartingConversation(false);
  
    console.log("[DEBUG] All inputs and chat cleared. Ready for a new session.");
  };

  const handleSend = async () => {
  // Ignore empty input
  if (!userInput.trim()) return;

  // Validate session
  if (!sessionId) {
    console.warn("[WARN] No sessionId available. Please start a conversation first.");
    alert("Please start a conversation first!");
    return;
  }

  // Validate doctor data
  if (!doctorData || !doctorData.id || !doctorData.name) {
    console.error("[ERROR] doctorData missing required fields:", doctorData);
    alert("Doctor information not loaded properly. Please reload the page.");
    return;
  }

  const payload = {
    session_id: sessionId,
    message: userInput,
    id: doctorData.id,
    username: doctorData.name,
    subject: subject,  // ✅ added subject
  };

  console.log("[DEBUG] Sending message payload:", JSON.stringify(payload, null, 2));

  try {
    setIsSending(true); // start button loading state

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/send_message_anz_way_model_evaluation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    console.log("[DEBUG] Raw response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ERROR] Server returned error:", errorText);
      throw new Error("Server error");
    }

    const data = await response.json();
    console.log("[DEBUG] Backend reply received:", data);

    // Update chat log
    setChatLog((prev) => [
      ...prev,
      { sender: "user", text: userInput },
      { sender: "bot", text: data.reply || "No response from server" },
    ]);

    setUserInput(""); // clear input after sending
  } catch (error) {
    console.error("[ERROR] handleSend failed:", error);
    alert("⚠️ Failed to get response from the tutor.");
  } finally {
    setIsSending(false); // reset button state
  }
};


  
  const handleStartConversation = async () => {
  console.log("[DEBUG] Starting conversation with values:", {
    username: doctorData.name,
    subject,
    marks,
    question_text,
  });

  // Validate required fields
  if (!subject || !marks || !question_text) {
    alert("Please fill all fields before starting the conversation!");
    return;
  }

  try {
    // Indicate loading state if needed
    setIsStartingConversation(true);

    const response = await fetch(
      "https://usefulapis-production.up.railway.app/chat_anz_way_model_evaluation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          marks,
          question_text,
          username: doctorData.name,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[DEBUG] Conversation response:", data);

    // Save session ID if returned
    if (data.session_id) setSessionId(data.session_id);

    // Initialize chat log with bot response
    setChatLog([
      {
        sender: "bot",
        text: data.reply || "No response from server",
      },
    ]);
  } catch (error) {
    console.error("Error starting conversation:", error);
    setChatLog([
      {
        sender: "bot",
        text: "⚠️ Failed to reach server. Please try again later.",
      },
    ]);
  } finally {
    setIsStartingConversation(false); // Reset loading state
  }
};


  return (
    <div
      style={{
        padding: "20px 0",          // ✅ vertical only, no left/right padding
        fontFamily: "Arial, sans-serif",
        width: "100%",              // ✅ take full width
        maxWidth: "100%",           // ✅ ignore previous 1200px limit
        margin: 0,                  // ✅ no auto-centering
        boxSizing: "border-box",
      }}
    >

      {/* ----------------- Your Given Section (kept intact) ----------------- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",     // ✅ allow items to move to next line if needed
          alignItems: "center",
          gap: 20,
          marginBottom: "12px",
        }}
      >

        {/* Subject Dropdown */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="subjectSelect"
            style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}
          >
            Subject:
          </label>
          <select
            id="subjectSelect"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              minWidth: 160,
            }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            <option value="sociology">Sociology</option>
            <option value="economics">Economics</option>
            <option value="history">History</option>
            <option value="political_science">Political Science</option>
            <option value="literature">Literature</option>
          </select>
        </div>
      
        {/* Marks Input */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="marksInput"
            style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}
          >
            Marks:
          </label>
          <input
            id="marksInput"
            type="number"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            placeholder="e.g. 6, 10, 20"
            style={{
              width: 80,
              padding: "5px 8px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>
      
        {/* Question Dropdown + Button */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            flex: 1,
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label
              htmlFor="questionSelect"
              style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}
            >
              Question:
            </label>
            <select
              id="questionSelect"
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                width: "100%",
              }}
              value={question_text}
              onChange={(e) => setQuestionText(e.target.value)}
            >
              <option value="">
                -- Select a valid question mark to see the list of questions --
              </option>
              {questionsByMarks[marks]?.map((q, idx) => (
                <option key={idx} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
      
          {/* Start Conversation Button */}
          <button
            onClick={handleStartConversation}
            disabled={isStartingConversation} // new state to track processing
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: isStartingConversation ? "#007bff" : "#4CAF50", // optional color change
              color: "white",
              fontWeight: "600",
              cursor: isStartingConversation ? "not-allowed" : "pointer",
              height: "fit-content",
              marginBottom: "2px",
            }}
          >
            {isStartingConversation ? "Starting Conversation..." : "Start Conversation"}
          </button>
          <button
            onClick={handleRefresh}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#2196F3", // blue color for refresh
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              height: "fit-content",
              marginBottom: "2px",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ----------------- Chatbot Section ----------------- */}
      <div
        style={{
          height: "70vh",         // use 70% of viewport height instead of fixed px
          maxHeight: "600px",     // optional: don’t let it grow too tall
          minHeight: "300px",     // optional: keep it usable on small screens
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "12px",
        }}
      >

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 10 }}>
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                margin: "5px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                  color: msg.sender === "user" ? "white" : "black",
                }}
                dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
              />
            </div>
          ))}
        </div>

        {/* Input box */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              resize: "none",        // user cannot manually resize
              overflow: "hidden",    // hide scrollbars
              fontFamily: "inherit",
              fontSize: "14px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                handleSend();
              }
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px"; // auto-expand
            }}
            onPaste={(e) => e.preventDefault()}  // prevent pasting
            onCopy={(e) => e.preventDefault()}   // prevent copying
          />
          <button
            onClick={handleSend}
            disabled={isSending} // new state to track sending
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: isSending ? "#007bff" : "#007bff", // color can stay same or change slightly
              color: "white",
              fontWeight: "600",
              cursor: isSending ? "not-allowed" : "pointer",
            }}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Ai_Learning;
