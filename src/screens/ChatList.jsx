import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import nhost from '../nhost'

const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      updated_at
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

  const handleCreate = async () => {
    const title = prompt('Name your chat') || 'New Chat'
    await createChat({ variables: { title } })
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div className="title">Your Chats</div>
        <div>
          <button className="btn ghost" onClick={() => nhost.auth.signOut()} style={{ marginRight: 8 }}>Sign out</button>
          <button className="btn primary" onClick={handleCreate} disabled={creating}>New Chat</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {loading && <div className="label">Loading...</div>}
        {error && <div className="error">{error.message}</div>}
        <ul className="list">
          {data?.chats?.map(c => (
            <li key={c.id} className="list-item">
              <Link to={`/chat/${c.id}`}>{c.title}</Link>
              <span className="label">{new Date(c.updated_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


