import { useState } from "react"

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return
    const userMessage = input
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
    } catch (err) {
      setMessages(prev => [...prev, { role: "error", text: "Could not reach backend. Is uvicorn running?" }])
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ color: "#FFC0CB" }}>🧠 MentorMind</h1>

      <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 300, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            {msg.role === "user" && (
              <div style={{ background: "#e8f4fd", padding: 10, borderRadius: 6 }}>
                <b>You:</b> {msg.text}
              </div>
            )}
            {msg.role === "tutor" && (
              <div>
                <div style={{ background: "#fff8e1", padding: 10, borderRadius: 6 }}>
                  <b>Tutor:</b> {msg.text}
                </div>
                <div style={{ background: "#f0fdf4", borderLeft: "3px solid #22c55e", padding: "6px 12px", fontSize: "0.9em" }}>
                  📊 Score: {msg.score}/10 — {msg.feedback}
                </div>
              </div>
            )}
            {msg.role === "error" && (
              <div style={{ color: "red", padding: 10 }}>{msg.text}</div>
            )}
          </div>
        ))}
        {loading && <div style={{ color: "#888" }}>Thinking...</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ddd", fontSize: "1em" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: "10px 20px", background: "#e94560", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "1em" }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  )
}