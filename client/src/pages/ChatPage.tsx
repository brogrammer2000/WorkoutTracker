import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHistory, sendMessage } from '@/services/ai'
import type { Message } from '@/types'

const INITIAL_PROMPT =
  'Please give me an initial fitness assessment based on my profile and tell me what you recommend to help me reach my goal.'

export default function ChatPage() {
  const queryClient = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['ai-history'],
    queryFn: fetchHistory,
  })

  const { mutate: send, isPending } = useMutation({
    mutationFn: (msg: string) => sendMessage(msg),
    onMutate: (msg) => {
      const temp: Message = { id: crypto.randomUUID(), role: 'user', content: msg, created_at: new Date().toISOString() }
      setOptimisticMessages((prev) => [...prev, temp])
    },
    onSuccess: () => {
      setOptimisticMessages([])
      queryClient.invalidateQueries({ queryKey: ['ai-history'] })
    },
  })

  // Trigger initial assessment if conversation is empty
  useEffect(() => {
    if (!isLoading && history.length === 0) {
      send(INITIAL_PROMPT)
    }
  }, [isLoading, history.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, optimisticMessages, isPending])

  function handleSend() {
    const msg = input.trim()
    if (!msg || isPending) return
    setInput('')
    send(msg)
  }

  const allMessages: Message[] = [...history, ...optimisticMessages]

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>AI Personal Trainer</h1>
      </div>

      <div style={styles.messages}>
        {isLoading && <p style={styles.hint}>Loading conversation…</p>}

        {allMessages.map((m) => (
          <div key={m.id} style={m.role === 'user' ? styles.userBubble : styles.assistantBubble}>
            <p style={styles.bubbleRole}>{m.role === 'user' ? 'You' : 'Trainer'}</p>
            <p style={styles.bubbleText}>{m.content}</p>
          </div>
        ))}

        {isPending && (
          <div style={styles.assistantBubble}>
            <p style={styles.bubbleRole}>Trainer</p>
            <p style={{ ...styles.bubbleText, color: '#888' }}>Thinking…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your trainer anything…"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={isPending}
        />
        <button style={styles.sendBtn} onClick={handleSend} disabled={isPending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 720, margin: '0 auto', padding: '0 16px' },
  header: { padding: '20px 0 12px', borderBottom: '1px solid #222' },
  heading: { fontSize: 20, fontWeight: 600 },
  messages: { flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 },
  hint: { color: '#888', fontSize: 14 },
  userBubble: { alignSelf: 'flex-end', maxWidth: '80%', background: '#1e3a2f', border: '1px solid #2d5a3d', borderRadius: 12, padding: '10px 14px' },
  assistantBubble: { alignSelf: 'flex-start', maxWidth: '80%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 14px' },
  bubbleRole: { fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },
  bubbleText: { fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  inputRow: { display: 'flex', gap: 10, padding: '16px 0', borderTop: '1px solid #222' },
  input: { flex: 1, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5', fontSize: 14 },
  sendBtn: { padding: '10px 20px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
}
