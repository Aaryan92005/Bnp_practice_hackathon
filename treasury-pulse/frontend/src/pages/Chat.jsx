import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { askAssistant } from '../api/client'

const SUGGESTIONS = ['Which entities are at risk?', 'How is Mumbai doing?', 'Why is EUR short next week?']

export default function Chat() {
  const { summaries } = useApp()
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me about cash positions, gaps or alerts.' },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const question = text.trim()
    if (!question || thinking) return
    setMessages((m) => [...m, { from: 'user', text: question }])
    setInput('')
    setThinking(true)
    try {
      const answer = await askAssistant(question, summaries)
      setMessages((m) => [...m, { from: 'bot', text: answer }])
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'Sorry, the assistant is not reachable right now.' }])
    } finally {
      setThinking(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>

      <div className="flex-1 overflow-auto bg-white border rounded-xl p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.from === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && <p className="text-sm text-slate-400">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 my-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}
            className="text-xs border rounded-full px-3 py-1 bg-white hover:bg-slate-50">{s}</button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about liquidity…" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="bg-emerald-600 text-white rounded-lg px-4">Send</button>
      </form>
    </div>
  )
}