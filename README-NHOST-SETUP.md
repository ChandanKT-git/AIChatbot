Setup Guide (Nhost + Hasura + n8n + OpenRouter)

1) Create Nhost project
- Create project at `https://console.nhost.io`
- Copy Backend URL, GraphQL HTTP/WS URLs
- Enable Email+Password auth

2) Frontend env (.env in frontend/)
```
VITE_NHOST_BACKEND_URL=
VITE_GRAPHQL_HTTP=
VITE_GRAPHQL_WS=
```
Or:
```
VITE_NHOST_SUBDOMAIN=
VITE_NHOST_REGION=
```

3) Hasura tables
- chats: id uuid pk, user_id uuid, title text, updated_at timestamptz
- messages: id uuid pk, chat_id uuid fk, user_id uuid, role text, content text, created_at timestamptz

4) Permissions (role: user)
- chats/messages: select/insert/update/delete where user_id = X-Hasura-User-Id; preset user_id on insert

5) Action sendMessage
SDL:
```
type Mutation { sendMessage(chat_id: uuid!): SendMessageOutput! }
type SendMessageOutput { ok: Boolean! }
```
- Webhook: n8n Webhook (POST)
- Forward client headers: on
- Permissions: role user

6) n8n
- Webhook → verify ownership via GraphQL using forwarded Authorization
- Fetch latest user message
- Call OpenRouter completions API (use credential)
- Save assistant message via GraphQL
- Return { ok: true }

7) Frontend flow
- /auth sign in/up
- / list chats, create chat
- /chat/:id subscribe to messages; on send: insert user message → call Action

8) Netlify
- Build `npm run build`; Publish `frontend/dist`; set VITE_ envs

9) Test
- Use Hasura Console with Authorization header (Nhost JWT)


