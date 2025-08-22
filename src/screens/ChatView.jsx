import { gql } from '@apollo/client'
import { useMutation, useQuery, useSubscription } from '@apollo/client/react'
import { useParams, Link } from 'react-router-dom'

const GET_CHAT = gql`
  query GetChat($id: uuid!) {
    chats_by_pk(id: $id) { id title }
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
  const { data: chatData } = useQuery(GET_CHAT, { variables: { id } })
  const { data: msgData } = useSubscription(MESSAGES_SUB, { variables: { chat_id: id } })
  const [sendUser] = useMutation(SEND_USER_MESSAGE)
  const [triggerBot, { loading: triggering }] = useMutation(SEND_BOT_ACTION)

  const handleSend = async (e) => {
    e.preventDefault()
    const form = e.target
    const value = form.elements.message.value.trim()
    if (!value) return
    form.reset()
    await sendUser({ variables: { chat_id: id, content: value } })
    await triggerBot({ variables: { chat_id: id } })
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div className="title">{chatData?.chats_by_pk?.title || 'Chat'}</div>
        <div><Link className="btn ghost" to="/">← Back</Link></div>
      </div>

      <div className="chat" style={{ marginTop: 16 }}>
        <div className="messages">
          {msgData?.messages?.map(m => (
            <div key={m.id} className={`bubble ${m.role}`}>
              {m.content}
            </div>
          ))}
        </div>
        <form className="composer" onSubmit={handleSend}>
          <input className="input" name="message" placeholder="Type a message..." autoFocus />
          <button className="btn primary" type="submit" disabled={triggering}>Send</button>
        </form>
      </div>
    </div>
  )
}


