# LLM Research App

LLM Research App is a SvelteKit platform to configure, share, and evaluate LLM setups.

It is designed for rapid experimentation: create model profiles, attach API keys securely, run chats, and review/export interaction data for analysis.

This project was developed for the Data Operations and Technology Knowledge Center at Nova SBE.

## What this project does

- Configure model behavior with parameters like temperature, top-p, top-k, penalties, max tokens, stop sequences, and system prompts.
- Manage API keys and bind them to model configurations.
- Test models in a chat interface with persisted conversations.
- Share model links so collaborators can open a model directly in chat.
- Export chat transcripts and analytics as JSON or CSV for downstream evaluation.
- Optionally inject file/document context into prompts for grounded responses.

## Tech stack

- Svelte 5 + SvelteKit 2
- TypeScript
- Tailwind CSS 4 + Bits UI component ecosystem
- PocketBase for auth and data storage
- Vercel AI SDK + OpenRouter provider for LLM streaming

## Core app areas

- Dashboard: Manage API keys, create/edit models, and view model-level analytics.
- Chat: Run live conversations against the currently selected model.
- Share routes: Select a model by URL and redirect into chat with that model preselected.
- API routes: Handle chat streaming, file handling, and utilities like PDF-to-text extraction.

## Environment variables

Create a `.env` file in the project root:

```env
# Public PocketBase URL used by client and server hooks
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090

# 32-byte hex key (64 chars) used to encrypt stored API keys
# Generate once and keep stable:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_char_hex_key
```

## Local development

1. Install dependencies:

```sh
pnpm install
```

2. Ensure PocketBase is running and accessible via `PUBLIC_POCKETBASE_URL`.

3. Start the dev server:

```sh
pnpm dev
```

4. Open the app and create an account.

5. In Dashboard:

- Add at least one API key.
- Create a model configuration.
- Open chat and test prompts.

## Available scripts

```sh
pnpm dev          # Start local dev server
pnpm build        # Build production bundle
pnpm preview      # Preview production build locally
pnpm check        # Svelte type/check pipeline
pnpm check:watch  # Continuous checks
pnpm lint         # ESLint + Prettier check
pnpm format       # Format codebase with Prettier
```

## Data and security notes

- API keys are encrypted server-side with AES-256-GCM using `ENCRYPTION_KEY`.
- Auth/session state is managed through PocketBase auth cookies.
- A browser-level chat creation limit is enforced for shared model testing flows.

## Typical workflow

1. Create API key.
2. Create model with prompt and sampling settings.
3. Share model URL with testers (optional).
4. Collect and export conversation data.
5. Iterate on prompts and configuration.

## Deployment

This is a standard SvelteKit app and can be deployed anywhere SvelteKit is supported (Node, serverless, edge with the proper adapter). Ensure runtime environment variables are configured in your deployment target.
