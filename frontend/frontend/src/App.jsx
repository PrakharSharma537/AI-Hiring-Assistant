import React, { useState, useRef, useEffect } from "react";

// Injected CSS for keyframes & animated placeholder effects
const Stylesheet = () => (
  <style>{`
    @keyframes pulseGlow {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.1); opacity: 0.85; }
    }
    @keyframes fadeInMsg {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseDot {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1.2); opacity: 1; }
    }
    .rec-card-hover:hover {
      background-color: rgba(255, 255, 255, 0.07) !important;
      border-color: rgba(168, 85, 247, 0.4) !important;
      transform: translateX(2px);
    }
    .input-box-focus:focus-within {
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.3) !important;
    }
  `}</style>
);

// Glowing Logo Component
const Web3GlowLogo = () => (
  <div style={{ position: "relative", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4)",
        filter: "blur(8px)",
        animation: "pulseGlow 3s infinite alternate",
      }}
    />
    <div
      style={{
        position: "relative",
        width: "36px",
        height: "36px",
        backgroundColor: "#12131a",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="url(#sparkle-grad)"
        />
        <defs>
          <linearGradient id="sparkle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="0.5" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

// Typewriter Effect Hook for Input Placeholder
const useAnimatedPlaceholder = (placeholders, speed = 80, delay = 2000) => {
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = placeholders[index];
    let timer;

    if (!isDeleting && placeholder.length < currentText.length) {
      timer = setTimeout(() => {
        setPlaceholder(currentText.substring(0, placeholder.length + 1));
      }, speed);
    } else if (!isDeleting && placeholder.length === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && placeholder.length > 0) {
      timer = setTimeout(() => {
        setPlaceholder(currentText.substring(0, placeholder.length - 1));
      }, speed / 2);
    } else if (isDeleting && placeholder.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % placeholders.length);
    }

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, index, placeholders, speed, delay]);

  return placeholder;
};

const App = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your Hiring Assessment Expert. Tell me about the job role or skills you are evaluating, and I will recommend suitable  tests.",
      recommendations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const placeholderText = useAnimatedPlaceholder([
    "Type 'Java Developer assessments'...",
    "Type 'Sales Leadership personality tests'...",
    "Type 'Frontend React skills test'...",
    "Type 'Numerical reasoning test for finance'..."
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            recommendations: data.recommendations || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={styles.appContainer}>
      <Stylesheet />

      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Web3GlowLogo />
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Hiring  Assistant</h3>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Talent Acquisition AI Agent</span>
          </div>
        </div>
        <span style={styles.badge}> AI Agent</span>
      </header>

      {/* Chat Messages */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              maxWidth: "82%",
              animation: "fadeInMsg 0.25s ease-out forwards",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
              }}
            >
              <div>{msg.content}</div>

              {/* Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={styles.recContainer}>
                  <span style={styles.recLabel}>Recommended  Tests</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {msg.recommendations.map((rec, i) => (
                      <div key={i} className="rec-card-hover" style={styles.recCard}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "#f3f4f6" }}>{rec.name}</span>
                          {rec.test_type && <span style={styles.typeBadge}>{rec.test_type}</span>}
                        </div>
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.recLink}
                        >
                          View Test
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Pulse Loading Indicator */}
        {loading && (
          <div style={{ alignSelf: "flex-start", animation: "fadeInMsg 0.25s ease-out forwards" }}>
            <div style={{ ...styles.messageBubble, ...styles.botBubble, display: "flex", gap: "6px", padding: "14px" }}>
              <span style={{ ...styles.pulseDot, animationDelay: "0s" }}></span>
              <span style={{ ...styles.pulseDot, animationDelay: "0.2s" }}></span>
              <span style={{ ...styles.pulseDot, animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <footer style={styles.inputContainer}>
        <div className="input-box-focus" style={styles.inputBox}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText}
            disabled={loading}
            style={styles.input}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              ...styles.button,
              opacity: !input.trim() || loading ? 0.4 : 1,
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  appContainer: {
    width: "100%",
    maxWidth: "760px",
    height: "88vh",
    margin: "24px auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1a1c26",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.08)",
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  },
  header: {
    backgroundColor: "rgba(18, 19, 26, 0.8)",
    padding: "16px 24px",
    display: "flex",
    justifySpaceBetween: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  badge: {
    fontSize: "0.72rem",
    padding: "4px 12px",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#c084fc",
  },
  chatBox: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    backgroundColor: "#12131a",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageBubble: {
    padding: "14px 18px",
    borderRadius: "16px",
    fontSize: "0.92rem",
    lineHeight: "1.5",
  },
  userBubble: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.25)",
  },
  botBubble: {
    backgroundColor: "#232636",
    color: "#f3f4f6",
    borderBottomLeftRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  recContainer: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  recLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    color: "#9ca3af",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "8px",
  },
  recCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 14px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  typeBadge: {
    fontSize: "0.68rem",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    color: "#c084fc",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  recLink: {
    color: "#60a5fa",
    fontSize: "0.78rem",
    textDecoration: "none",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pulseDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#a855f7",
    borderRadius: "50%",
    animation: "pulseDot 1.2s infinite ease-in-out both",
  },
  inputContainer: {
    padding: "16px 20px",
    backgroundColor: "#1a1c26",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#12131a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "28px",
    padding: "4px 6px 4px 18px",
    transition: "all 0.2s ease",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#ffffff",
    fontSize: "0.9rem",
  },
  button: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s ease",
  },
};

export default App;