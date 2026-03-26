import { useState, useRef, useEffect } from "react"

const COLORS = {
  bg:         "#0d0d1a",
  surface:    "#16213e",
  surfaceAlt: "#1a2744",
  border:     "#2a3a5c",
  accent:     "#e94560",
  accentSoft: "#ff6b81",
  teal:       "#00b4d8",
  muted:      "#8892a4",
  text:       "#e8eaf0",
  textSoft:   "#b0b8cc",
  userBubble: "#1e3a6e",
  tutorBubble:"#1a2744",
  scoreGreen: "#22c55e",
  scoreYellow:"#f59e0b",
  scoreRed:   "#ef4444",
}

function ScoreBar({ score }) {
  const pct = (score / 10) * 100
  const color = score >= 7 ? COLORS.scoreGreen : score >= 4 ? COLORS.scoreYellow : COLORS.scoreRed
  const label = score >= 8 ? "Excellent" : score >= 6 ? "Good" : score >= 4 ? "Developing" : "Keep going"
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "sans-serif" }}>Understanding</span>
        <span style={{ fontSize: 11, fontWeight: "bold", color, fontFamily: "sans-serif" }}>
          {score}/10 · {label}
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 3, background: "#2a3a5c", overflow: "hidden"
      }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 3,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: "width 0.6s ease"
        }} />
      </div>
    </div>
  )
}

function WelcomeMessage() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", padding: "40px 24px",
      textAlign: "center", gap: 12
    }}>
      <div style={{ fontSize: 40 }}>🧠</div>
      <p style={{ color: COLORS.text, fontSize: 15, fontWeight: 600,
                  fontFamily: "sans-serif", margin: 0 }}>
        Ready to learn?
      </p>
      <p style={{ color: COLORS.muted, fontSize: 13, fontFamily: "sans-serif",
                  margin: 0, lineHeight: 1.6, maxWidth: 280 }}>
        Share what you think you know about a topic. I'll guide you deeper with questions — not answers.
      </p>
      <div style={{
        marginTop: 8, display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320
      }}>
        {[
          "I think embeddings represent meaning as numbers…",
          "Cosine similarity measures the angle between vectors…",
          "RAG works by retrieving relevant chunks before generating…",
        ].map((hint, i) => (
          <div key={i} style={{
            padding: "7px 12px", borderRadius: 8,
            background: "#1e2d4a", border: `1px solid ${COLORS.border}`,
            color: COLORS.muted, fontSize: 12, fontFamily: "sans-serif",
            textAlign: "left", fontStyle: "italic"
          }}>
            "{hint}"
          </div>
        ))}
      </div>
      <p style={{ color: "#3a4a6a", fontSize: 11, fontFamily: "sans-serif",
                  margin: 0, marginTop: 4 }}>
        Try one of these or type your own
      </p>
    </div>
  )
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{
          maxWidth: "78%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px",
          background: COLORS.userBubble,
          border: `1px solid #2a4a8a`,
          color: COLORS.text, fontSize: 14, fontFamily: "sans-serif", lineHeight: 1.55
        }}>
          <span style={{ fontSize: 10, color: COLORS.muted, display: "block",
                         marginBottom: 4, textAlign: "right" }}>You</span>
          {msg.text}
        </div>
      </div>
    )
  }

  if (msg.role === "tutor") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
        <div style={{ maxWidth: "82%" }}>
          <div style={{
            padding: "11px 15px", borderRadius: "16px 16px 16px 4px",
            background: COLORS.tutorBubble,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text, fontSize: 14, fontFamily: "sans-serif", lineHeight: 1.55
          }}>
            <span style={{ fontSize: 10, color: COLORS.teal, display: "block",
                           marginBottom: 4, fontWeight: 600 }}>🧑‍🏫 Tutor</span>
            {msg.text}
          </div>
          <div style={{
            marginTop: 6, padding: "10px 14px", borderRadius: 10,
            background: "#111827",
            border: `1px solid ${COLORS.border}`,
          }}>
            <ScoreBar score={msg.score} />
            <p style={{
              margin: "8px 0 0 0", fontSize: 12, color: COLORS.textSoft,
              fontFamily: "sans-serif", lineHeight: 1.5, fontStyle: "italic"
            }}>
              {msg.feedback}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (msg.role === "error") {
    return (
      <div style={{
        padding: "10px 14px", borderRadius: 10, marginBottom: 12,
        background: "#2d1515", border: "1px solid #6b2020",
        color: "#fca5a5", fontSize: 13, fontFamily: "sans-serif"
      }}>
        ⚠️ {msg.text}
      </div>
    )
  }
  return null
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput("")
    setLoading(true)
    setMessages(prev => [...prev, { role: "user", text: userMessage }])

    try {
      const res = await fetch("http://127.0.0.1:8000/session/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: "tutor",
        text: data.reply,
        score: data.score,
        feedback: data.feedback
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "error",
        text: "Could not reach backend. Is uvicorn running?"
      }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px 24px"
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 800, fontFamily: "sans-serif",
          color: COLORS.text, letterSpacing: "-0.5px"
        }}>
          <span style={{ marginRight: 10 }}>🧠</span>
          <span style={{ color: COLORS.accent }}>Mentor</span>Mind
        </h1>
        <p style={{
          margin: "6px 0 0", fontSize: 13, color: COLORS.muted,
          fontFamily: "sans-serif", letterSpacing: "0.3px"
        }}>
          Your Socratic learning coach · Powered by RAG + LLM
        </p>
      </div>

      {/* Chat window */}
      <div style={{
        width: "100%", maxWidth: 680,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column",
        minHeight: 420, maxHeight: "60vh",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        {/* Chat body */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 20px 8px",
          scrollbarWidth: "thin",
          scrollbarColor: `${COLORS.border} transparent`
        }}>
          {messages.length === 0
            ? <WelcomeMessage />
            : messages.map((msg, i) => <Message key={i} msg={msg} />)
          }
          {loading && (
            <div style={{ display: "flex", gap: 5, padding: "8px 4px", alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: COLORS.teal, opacity: 0.7,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
              <span style={{ color: COLORS.muted, fontSize: 12,
                             fontFamily: "sans-serif", marginLeft: 4 }}>
                Thinking…
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: COLORS.border }} />

        {/* Input bar */}
        <div style={{
          display: "flex", gap: 10, padding: "14px 16px",
          background: COLORS.surfaceAlt, alignItems: "center"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Share what you think you know…"
            disabled={loading}
            style={{
              flex: 1, padding: "10px 14px",
              borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.surface, color: COLORS.text,
              fontSize: 14, fontFamily: "sans-serif", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = COLORS.accent}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: loading || !input.trim()
                ? "#2a3a5c"
                : `linear-gradient(135deg, ${COLORS.accent}, #c0392b)`,
              color: loading || !input.trim() ? COLORS.muted : "white",
              fontSize: 14, fontWeight: 600, fontFamily: "sans-serif",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap"
            }}
          >
            {loading ? "…" : "Send →"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 16, fontSize: 11, color: "#2a3a5c",
        fontFamily: "sans-serif", textAlign: "center"
      }}>
        MentorMind · RAG + Groq + Gemini · Built by Mina
      </p>

      <style>{`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    background: #0d0d1a;
    min-height: 100vh;
    width: 100%;
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3a5c; border-radius: 2px; }
`}</style>
    </div>
  )
}