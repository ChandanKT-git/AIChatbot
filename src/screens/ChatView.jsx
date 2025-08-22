import { gql } from '@apollo/client'
import { useMutation, useQuery, useSubscription } from '@apollo/client/react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const GET_CHAT = gql`
  query GetChat($id: uuid!) {
    chats_by_pk(id: $id) { 
      id 
      title 
      user_id
    }
  }
`

const MESSAGES_SUB = gql`
  subscription Messages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      role
      content
      created_at
    }
  }
`

const SEND_USER_MESSAGE = gql`
  mutation SendUserMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chat_id, role: "user", content: $content }) {
      id
    }
  }
`

const SEND_BOT_ACTION = gql`
  mutation SendMessageAction($chat_id: uuid!) {
    sendMessage(chat_id: $chat_id) {
      ok
    }
  }
`

export default function ChatView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: chatData, loading: chatLoading, error: chatError } = useQuery(GET_CHAT, { 
    variables: { id },
    onError: (err) => {
      if (err.message.includes('permission denied')) {
        navigate('/')
      }
    }
  })
  
  const { data: msgData, loading: msgLoading, error: msgError } = useSubscription(MESSAGES_SUB, { 
    variables: { chat_id: id } 
  })
  
  const [sendUser, { loading: sending }] = useMutation(SEND_USER_MESSAGE, {
    onError: (err) => {
      setError('Failed to send message: ' + err.message)
      setTimeout(() => setError(''), 5000)
    }
  })
  
  const [triggerBot, { loading: triggering }] = useMutation(SEND_BOT_ACTION, {
    onError: (err) => {
      setError('Failed to trigger AI response: ' + err.message)
      setTimeout(() => setError(''), 5000)
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [msgData?.messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || sending || triggering) return
    
    const content = message.trim()
    setMessage('')
    setIsTyping(true)
    setError('')
    
    try {
      // Send user message
      await sendUser({ variables: { chat_id: id, content } })
      
      // Trigger AI response
      await triggerBot({ variables: { chat_id: id } })
      
      setSuccess('Message sent! AI is thinking...')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to send message: ' + err.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (chatLoading) {
    return (
      <div className="app-shell">
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="label">Loading chat...</div>
        </div>
      </div>
    )
  }

  if (chatError || !chatData?.chats_by_pk) {
    return (
      <div className="app-shell">
        <div className="error-state">
          <div className="label">Chat not found</div>
          <div className="muted">This chat may have been deleted or you don't have access to it.</div>
          <button className="btn primary" onClick={() => navigate('/')}>
            Back to Chats
          </button>
        </div>
      </div>
    )
  }

  const chat = chatData.chats_by_pk
  const messages = msgData?.messages || []
  const hasMessages = messages.length > 0

  return (
    <div className="app-shell">
      <div className="header">
        <div className="chat-info">
          <div className="chat-title">{chat.title}</div>
          <div className="chat-meta">
            <span className="time">{hasMessages ? `${messages.length} messages` : 'No messages yet'}</span>
          </div>
        </div>
        <div className="chat-actions">
          <Link className="btn ghost" to="/">← Back</Link>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="btn ghost" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="message success">
          {success}
        </div>
      )}

      <div className="chat" style={{ marginTop: 16 }}>
        <div className="messages">
          {!hasMessages ? (
            <div className="empty-state">
              <div className="label">Start the conversation</div>
              <div className="muted">Send a message to begin chatting with AI</div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`bubble ${m.role}`}>
                <div className="bubble-content">{m.content}</div>
                <div className="bubble-time">{formatTime(m.created_at)}</div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="bubble assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="composer" onSubmit={handleSend}>
          <input 
            className="input" 
            name="message" 
            placeholder="Type your message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending || triggering}
            autoFocus 
          />
          <button 
            className="btn primary" 
            type="submit" 
            disabled={!message.trim() || sending || triggering}
          >
            {sending ? 'Sending...' : triggering ? 'AI Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}


