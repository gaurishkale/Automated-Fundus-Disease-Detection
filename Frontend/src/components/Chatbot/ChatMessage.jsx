import { useState } from "react";

const LANG_LABELS = { en: "EN", hi: "हिं", mr: "मर" };

function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const [playing, setPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (!message.text || playing) return;
    setPlaying(true);
    try {
      const res = await fetch("http://localhost:8000/chatbot/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.text, language: message.language || "en" }),
      });
      const data = await res.json();
      if (data.status === "success" && data.audio) {
        const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          setPlaying(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => setPlaying(false);
        audio.play();
      } else {
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
    }
  };

  return (
    <div className={`chatbot-msg-row ${isUser ? "chatbot-msg-user" : "chatbot-msg-ai"}`}>
      {!isUser && (
        <div className="chatbot-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 14a8 8 0 0 1-6-2.7A4 4 0 0 1 10 13h4a4 4 0 0 1 4 3.3A8 8 0 0 1 12 19Z" />
          </svg>
        </div>
      )}
      <div className={`chatbot-bubble ${isUser ? "chatbot-bubble-user" : "chatbot-bubble-ai"}`}>
        {message.language && !isUser && (
          <span className="chatbot-lang-badge">{LANG_LABELS[message.language] || "EN"}</span>
        )}
        <div className="chatbot-bubble-text">{message.text}</div>
        {!isUser && message.text && (
          <button
            className={`chatbot-speak-btn ${playing ? "chatbot-speak-active" : ""}`}
            onClick={handlePlayAudio}
            title="Listen"
            disabled={playing}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="6" height="16" rx="1" />
                <rect x="14" y="4" width="6" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
