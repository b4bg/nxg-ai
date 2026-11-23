# NXG AI
A private, responsive AI chat workspace based on NXG principles. Includes conversation search, local history, export/delete, six focus modes, response depth, cancellation, and a server-side OpenAI Responses API integration.

## Run
Node 22+: `npm run build`, then `npm run dev`. No package installation needed. Open http://localhost:4173.

Set OPENAI_API_KEY securely in the server environment to enable responses. OPENAI_MODEL optionally overrides gpt-4.1-mini. Never place secrets in browser code. On Sites, configure the secret using the OpenAI Developers plugin workflow. Without a key, the app explicitly reports that setup is needed and does not simulate replies.

Chats are browser-local and not synced. Only the last 40 messages are sent for context. No browsing, uploads, or code execution tools are connected. UI displays responses safely as plain text. API requests use store:false. Live AI verification requires a configured key.

# off campus code:TWNB6V


Finish offline AI setup: Connect Ollama and download a model so NXG can answer without API credits.
Show answers as they’re generated: Display responses word by word instead of waiting for the entire answer.
Improve formatting: Render headings, lists, and code blocks with a copy-code button.
Add document chat: Let users upload PDFs or text files and ask questions about them.
Add voice input: Allow users to speak their questions.
Offer model selection: Switch between faster models and more capable ones.
Add optional memory: Remember preferences, with controls to view, edit, and delete what NXG stores.
Package it as a Mac app: Give NXG its own icon and window.
