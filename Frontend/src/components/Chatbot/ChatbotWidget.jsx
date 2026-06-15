import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import VoiceInput from "./VoiceInput";
import "./chatbot.css";

const API_BASE = "http://localhost:8000/chatbot";

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && sessionStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, sessionStarted]);

  const startSession = async () => {
    const name = patientName.trim();
    if (!name || !age) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/start_session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: name,
          age: parseInt(age, 10),
          symptoms: symptoms.trim(),
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSessionId(data.session_id);
        setSessionStarted(true);
        setMessages([{ role: "assistant", text: data.greeting, language: "en" }]);
        playAudioResponse(data.greeting, "en");
      } else {
        setMessages([
          { role: "assistant", text: "Failed to start session. Please try again.", language: "en" },
        ]);
        setSessionStarted(true);
      }
    } catch {
      setMessages([
        {
          role: "assistant",
          text: "Unable to connect to the AI assistant. Please make sure the backend server is running.",
          language: "en",
        },
      ]);
      setSessionStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text, language) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", text: trimmed, language: language || null };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language: language || null, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.session_id) setSessionId(data.session_id);
        const aiMsg = { role: "assistant", text: data.response, language: data.language };
        setMessages((prev) => [...prev, aiMsg]);
        playAudioResponse(data.response, data.language);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Sorry, something went wrong. Please try again.", language: "en" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Unable to connect to the AI assistant. Please make sure the backend server is running.",
          language: "en",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const playAudioResponse = async (text, language) => {
    try {
      const res = await fetch(`${API_BASE}/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: language || "en" }),
      });
      const data = await res.json();
      if (data.status === "success" && data.audio) {
        const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play().catch(() => {});
      }
    } catch {
      /* TTS is non-critical */
    }
  };

  const handleVoiceTranscript = (text, language) => {
    if (text) {
      sendMessage(text, language);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGreetingKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startSession();
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setSessionId(null);
    setMessages([]);
    setPatientName("");
    setAge("");
    setSymptoms("");
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chatbot-fab ${open ? "chatbot-fab-hidden" : ""}`}
        onClick={() => setOpen(true)}
        title="AI Eye Assistant"
        aria-label="Open AI Eye Assistant"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          <circle cx="12" cy="11.5" r="1" fill="currentColor" />
          <circle cx="8" cy="11.5" r="1" fill="currentColor" />
          <circle cx="16" cy="11.5" r="1" fill="currentColor" />
        </svg>
        <span className="chatbot-fab-label">AI Eye Assistant</span>
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${open ? "chatbot-panel-open" : ""}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              </svg>
            </div>
            <div>
              <div className="chatbot-header-title">EyeDetect AI Assistant</div>
              <div className="chatbot-header-subtitle">Ask about eye diseases, symptoms &amp; prevention</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {sessionStarted && (
              <button
                className="chatbot-close-btn"
                onClick={resetSession}
                aria-label="New session"
                title="Start new session"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            )}
            <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {!sessionStarted ? (
          /* Greeting Form */
          <div className="chatbot-greeting-form">
            <div className="chatbot-greeting-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0f8a8a" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              </svg>
            </div>
            <h3 className="chatbot-greeting-title">Welcome to EyeDetect AI</h3>
            <p className="chatbot-greeting-subtitle">
              Please enter your details to begin your consultation.
            </p>
            <div className="chatbot-greeting-fields">
              <input
                type="text"
                className="chatbot-greeting-input"
                placeholder="Your Name *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onKeyDown={handleGreetingKeyDown}
                autoFocus
              />
              <input
                type="number"
                className="chatbot-greeting-input"
                placeholder="Age *"
                min="0"
                max="150"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={handleGreetingKeyDown}
              />
              <textarea
                className="chatbot-greeting-input chatbot-greeting-textarea"
                placeholder="Describe your symptoms (optional)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
              />
              <button
                className="chatbot-greeting-btn"
                onClick={startSession}
                disabled={loading || !patientName.trim() || !age}
              >
                {loading ? "Starting..." : "Start Consultation"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {loading && (
                <div className="chatbot-msg-row chatbot-msg-ai">
                  <div className="chatbot-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 14a8 8 0 0 1-6-2.7A4 4 0 0 1 10 13h4a4 4 0 0 1 4 3.3A8 8 0 0 1 12 19Z" />
                    </svg>
                  </div>
                  <div className="chatbot-bubble chatbot-bubble-ai">
                    <div className="chatbot-thinking-label">AI is thinking...</div>
                    <div className="chatbot-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chatbot-input-area">
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
              <input
                ref={inputRef}
                type="text"
                className="chatbot-text-input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="chatbot-send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                title="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22,2 15,22 11,13 2,9" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ChatbotWidget;
