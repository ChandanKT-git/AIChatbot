import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import nhost from '../nhost'

const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
    }
  }
`

export default function ChatList() {
  const { data, loading, error, refetch } = useQuery(GET_CHATS)
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    onCompleted: () => refetch()
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newChatTitle.trim()) return
    
    try {
      await createChat({ variables: { title: newChatTitle.trim() } })
      setNewChatTitle('')
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create chat:', err)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getMessageCount = (chat) => {
    return chat.messages_aggregate?.aggregate?.count || 0
  }

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="label">Loading your chats...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="error-state">
          <div className="label">Failed to load chats</div>
          <div className="muted">{error.message}</div>
          <button className="btn primary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const chats = data?.chats || []
  const hasChats = chats.length > 0

  return (
    <div className="app-shell">
      <div className="header">
        <div className="title">Your Chats</div>
        <div className="chat-actions">
          <button className="btn ghost" onClick={() => nhost.auth.signOut()}>
            Sign out
          </button>
          <button 
            className="btn primary" 
            onClick={() => setShowCreateForm(true)}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'New Chat'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginTop: 16 }}>
          <form onSubmit={handleCreate} className="form">
            <label className="label" htmlFor="new-chat-title">Chat Title</label>
            <input
              id="new-chat-title"
              className="input"
              type="text"
              placeholder="Enter a title for your chat..."
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              autoFocus
              required
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                type="submit" 
                className="btn primary"
                disabled={!newChatTitle.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Chat'}
              </button>
              <button 
                type="button" 
                className="btn ghost"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewChatTitle('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        {!hasChats ? (
          <div className="empty-state">
            <div className="label">No chats yet</div>
            <div className="muted">Start a conversation to begin chatting with AI</div>
            <button 
              className="btn primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create your first chat
            </button>
          </div>
        ) : (
          <ul className="list">
            {chats.map(chat => (
              <li key={chat.id} className="list-item">
                <div className="chat-info">
                  <Link to={`/chat/${chat.id}`} className="chat-title">
                    {chat.title}
                  </Link>
                  <div className="chat-meta">
                    <span className="time">{formatTime(chat.updated_at)}</span>
                    <span className="muted">•</span>
                    <span className="muted">{getMessageCount(chat)} messages</span>
                  </div>
                </div>
                <div className="chat-actions">
                  <Link to={`/chat/${chat.id}`} className="btn ghost">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


