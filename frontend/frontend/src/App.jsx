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
    .opt-btn:hover {
      background-color: rgba(139, 92, 246, 0.15) !important;
      border-color: #8b5cf6 !important;
    }
  `}</style>
);

const Web3GlowLogo = () => (
  <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const App = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your Hiring Assessment Expert. Tell me about the job role or skills you are evaluating, and I will recommend suitable tests.",
      recommendations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null); 
  
  // Test Practice Dynamic States
  const [activeTest, setActiveTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [testFinished, setTestFinished] = useState(false);

  const chatEndRef = useRef(null);

  const placeholderText = useAnimatedPlaceholder([
    "Type 'Java Developer assessments'...",
    "Type 'JavaScript or React skills test'...",
    "Type 'Python or SQL assessment'...",
    "Type '.NET or C++ Developer test'..."
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
      const response = await fetch(`${API_URL}/chat`, {
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

  // Dynamic Questions Fetcher from Backend
  const handleStartTest = async () => {
    if (!selectedTest) return;
    setFetchingQuestions(true);

    try {
      const res = await fetch(`${API_URL}/get-test-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_id: selectedTest.id,
          test_name: selectedTest.name,
        }),
      });

      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        setTestQuestions(data.questions);
        setActiveTest(selectedTest);
        setSelectedTest(null);
        setCurrentQIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setTestFinished(false);
      } else {
        alert("Failed to load questions for this test.");
      }
    } catch (err) {
      alert("Error connecting to backend server.");
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleAnswerSelect = (optionIdx) => {
    setSelectedAnswer(optionIdx);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === testQuestions[currentQIndex]?.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentQIndex + 1 < testQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setTestFinished(true);
    }
  };

  const handleExitTest = () => {
    setActiveTest(null);
    setTestQuestions([]);
    setTestFinished(false);
  };

  return (
    <div style={styles.appContainer}>
      <Stylesheet />

      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Web3GlowLogo />
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Hiring Assistant</h3>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Talent Acquisition AI Agent</span>
          </div>
        </div>
        <span style={styles.badge}>{activeTest ? "Assessment Mode" : "AI Agent"}</span>
      </header>

      {/* CONDITIONAL RENDER: ACTIVE ASSESSMENT INTERFACE */}
      {activeTest ? (
        <div style={styles.testContainer}>
          {!testFinished ? (
            <div style={{ width: "100%", maxWidth: "600px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                <span style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: "600" }}>{activeTest.name}</span>
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                  Question {currentQIndex + 1} of {testQuestions.length}
                </span>
              </div>

              <div style={styles.qCard}>
                <h4 style={{ color: "#ffffff", marginBottom: "20px", fontSize: "1rem", lineHeight: "1.5" }}>
                  {testQuestions[currentQIndex]?.question}
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {testQuestions[currentQIndex]?.options.map((opt, i) => (
                    <button
                      key={i}
                      className="opt-btn"
                      onClick={() => handleAnswerSelect(i)}
                      style={{
                        ...styles.optionBtn,
                        backgroundColor: selectedAnswer === i ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.04)",
                        borderColor: selectedAnswer === i ? "#8b5cf6" : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <span style={{ fontWeight: "bold", marginRight: "10px", color: selectedAnswer === i ? "#c084fc" : "#9ca3af" }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
                  <button onClick={handleExitTest} style={styles.exitBtn}>Exit Test</button>
                  <button 
                    onClick={handleNextQuestion} 
                    disabled={selectedAnswer === null}
                    style={{
                      ...modalStyles.startBtn,
                      opacity: selectedAnswer === null ? 0.5 : 1,
                      cursor: selectedAnswer === null ? "not-allowed" : "pointer"
                    }}
                  >
                    {currentQIndex + 1 === testQuestions.length ? "Finish Assessment" : "Next Question"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Test Result View */
            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2 style={{ color: "#ffffff", marginBottom: "8px" }}>Assessment Completed! 🎉</h2>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Evaluated for {activeTest.name}</p>
              
              <div style={styles.scoreCard}>
                <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#c084fc" }}>
                  {score} / {testQuestions.length}
                </span>
                <span style={{ color: "#9ca3af", fontSize: "0.8rem", display: "block", marginTop: "4px" }}>Total Score</span>
              </div>

              <button onClick={handleExitTest} style={modalStyles.startBtn}>
                Back to Assistant Chat
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CHAT VIEW */
        <>
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

                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div style={styles.recContainer}>
                      <span style={styles.recLabel}>Recommended Tests</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {msg.recommendations.map((rec, i) => (
                          <div key={i} className="rec-card-hover" style={styles.recCard}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "#f3f4f6" }}>{rec.name}</span>
                              {rec.test_type && <span style={styles.typeBadge}>{rec.test_type}</span>}
                            </div>
                            
                            <button
                              onClick={() => setSelectedTest(rec)}
                              style={styles.recButton}
                            >
                              View Test
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

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
        </>
      )}

      {/* Internal Test Details Modal */}
      {selectedTest && (
        <div style={modalStyles.overlay} onClick={() => setSelectedTest(null)}>
          <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h3 style={{ margin: 0, color: "#ffffff", fontSize: "1.1rem" }}>{selectedTest.name}</h3>
              <button style={modalStyles.closeBtn} onClick={() => setSelectedTest(null)}>✕</button>
            </div>

            <div style={modalStyles.body}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={modalStyles.infoTag}>ID: {selectedTest.id || "N/A"}</span>
                <span style={modalStyles.infoTag}>Type: {selectedTest.test_type || "Knowledge"}</span>
              </div>
              
              <p style={{ color: "#d1d5db", fontSize: "0.88rem", lineHeight: "1.6", margin: "12px 0" }}>
                This assessment evaluates domain proficiency, practical technical concepts, and problem-solving skill sets required for this role.
              </p>

              <div style={modalStyles.featuresBox}>
                <div style={modalStyles.featureItem}>⏱ Duration: ~5 Mins</div>
                <div style={modalStyles.featureItem}>📝 Questions: Multiple Choice</div>
                <div style={modalStyles.featureItem}>🎯 Source: Dynamic Backend/AI</div>
              </div>

              <button 
                onClick={handleStartTest}
                disabled={fetchingQuestions}
                style={{
                  ...modalStyles.startBtn,
                  opacity: fetchingQuestions ? 0.7 : 1,
                  cursor: fetchingQuestions ? "wait" : "pointer"
                }}
              >
                {fetchingQuestions ? "Fetching Questions..." : "Start Practice Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    justifyContent: "space-between",
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
  testContainer: {
    flex: 1,
    padding: "24px",
    backgroundColor: "#12131a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  qCard: {
    backgroundColor: "#232636",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  optionBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  },
  exitBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#9ca3af",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  scoreCard: {
    margin: "24px 0",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "20px 40px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
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
  recButton: {
    color: "#60a5fa",
    fontSize: "0.78rem",
    fontWeight: "600",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
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

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#1f222e",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "460px",
    padding: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "14px",
  },
  infoTag: {
    fontSize: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    color: "#a7f3d0",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  featuresBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: "12px",
    borderRadius: "8px",
    margin: "12px 0",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  featureItem: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  startBtn: {
    marginTop: "10px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default App;