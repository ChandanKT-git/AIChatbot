Expected Hasura schema (simplified):

- tables
  - chats: id uuid pk, user_id uuid fk (auth.user.id), title text, updated_at timestamptz
  - messages: id uuid pk, chat_id uuid fk -> chats.id, user_id uuid fk, role text ('user'|'assistant'), content text, created_at timestamptz

- permissions:
  - role: user → can select/insert/update/delete only where user_id = X-Hasura-User-Id
  - RLS enforced via Hasura permissions

- action:
  - sendMessage(chat_id: uuid): { ok: Boolean! }



