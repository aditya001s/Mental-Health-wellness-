# MindSpace – Mental Health & Wellness

## Project Overview

MindSpace is a mental wellness web application intended to make it easier for people to find a supportive space, talk through what is on their mind, and connect with peers. It combines an AI chat experience with peer support requests and conversations. It is a wellness tool, not a clinical service.

## Key Features

- **Account access:** Email and password sign-up, sign-in, and sign-out using Supabase Auth.
- **Guided onboarding and profile:** Collect and update profile, lifestyle, support, and privacy preferences.
- **AI companion chat:** Chat with the app's AI companion. Chat messages can be saved to the Supabase database.
- **AI-generated message analysis:** The AI chat flow requests structured emotion and risk-related analysis and can save analysis data with messages. This output is model-generated and is not a clinical assessment.
- **Peer support requests:** Create and withdraw support tickets, browse other users' tickets, filter requests, and respond to requests.
- **Peer conversations and inbox:** Open peer conversations, send messages, view an inbox, and receive Supabase Realtime updates.
- **In-chat safety UI:** Client-side message checks and warning prompts are present. These are basic application checks, not a professional moderation service.
- **App navigation and appearance:** Responsive navigation, toast notifications, and a light/dark appearance toggle.

Peer-request workflows depend on a `match_requests` database table, but that table is not created by the SQL files currently included in this repository. See [Supabase Setup](#supabase-setup) before enabling those workflows on a new project.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 5 |
| Backend services | Supabase Auth, Supabase Edge Functions (Deno / TypeScript), Supabase Realtime |
| Database | Supabase-hosted PostgreSQL |
| AI | OpenRouter API using `qwen/qwen-2.5-72b-instruct`, called through the `openrouter-chat` Edge Function |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| UI and state | Framer Motion, Lucide React, Heroicons, React Hook Form, Zustand, React Router |
| Development tools | npm (lockfile), TypeScript, ESLint, Vite, Supabase CLI package |

There is no separate application server in this repository; backend operations are implemented using Supabase services and Edge Functions.

## Project Structure

```text
mental_wellness_bolt_hackathon/
├── public/                      # Static images and public assets
├── src/
│   ├── components/
│   │   ├── auth/                # Sign-in and sign-up screens
│   │   ├── chat/                # AI and peer chat interfaces
│   │   ├── dashboard/           # Home and dashboard screens
│   │   ├── flags/               # Browse peer support requests
│   │   ├── inbox/               # Conversation inbox
│   │   ├── onboarding/          # Onboarding flow and steps
│   │   ├── peer/                # Peer matching and request management
│   │   ├── profile/             # Profile and preference editing
│   │   └── ui/                  # Navigation, toast, loading, safety UI
│   ├── hooks/                   # Chat hook
│   ├── lib/                     # Supabase client, moderation, fetch/realtime helpers
│   ├── services/                # AI service
│   ├── store/                   # Zustand auth, inbox, request, and ticket stores
│   ├── App.tsx                  # Routes and application-level state effects
│   ├── index.css                # Tailwind layers and global styling
│   └── main.tsx                 # React application entry point
├── supabase/
│   ├── functions/               # Supabase Edge Functions
│   └── new-migrations/          # SQL schema and policy files (non-default folder name)
├── .env.example                 # Environment-variable template
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig*.json
└── vite.config.ts
```

The checked-in SQL files are:

```text
supabase/new-migrations/
├── 20250623151342_mute_butterfly.sql
├── 20250625092705_pink_salad.sql
├── 20250625105316_bright_union.sql
└── 20251102120000_add_sender_role.sql
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- A Supabase project for authentication and backend functionality
- An OpenRouter API key if you want to enable the AI chat and analysis path

The workspace does not include a Git remote URL or pin a Node.js version. Replace `<repository-url>` below with the URL for your clone:

```bash
git clone <repository-url>
cd mental_wellness_bolt_hackathon
npm ci
```

Create a local environment file from the template. For PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Set the Supabase project URL and anon key in `.env.local` as described under [Environment Variables](#environment-variables). These two values are required for the frontend to initialize. Apply the database setup and deploy the required Edge Functions as described below.

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local URL when the server starts (normally `http://localhost:5173`).

## Environment Variables

The following variables appear in `.env.example`. The distinction below reflects both the template's comments and the current source references.

| Variable | Intended purpose | Scope and current implementation |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | **Frontend; required and read by the app.** |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public client key | **Frontend; required and read by the app.** It is public to browser users; protect data with correct Supabase Row Level Security policies. |
| `ANTHROPIC_API_KEY` | Anthropic provider key | Server-side secret according to its purpose. Listed as required in the template, but no Anthropic integration is referenced by the current application code. |
| `PERPLEXITY_API_KEY` | Perplexity provider key | Server-side secret; optional in the template and not used by the current application code. |
| `OPENAI_API_KEY` | OpenAI/OpenRouter provider key | Server-side secret; optional in the template and not used by the active AI path. The active OpenRouter path uses `OPENROUTER_API_KEY`. |
| `VITE_GOOGLE_API_KEY` | Google Gemini key | Frontend-exposed because it uses the `VITE_` prefix. The template describes it as required for Gemini, but the current application code does not use Gemini. Do not put a private server key in a `VITE_` variable. |
| `OPENROUTER_API_KEY` | OpenRouter key for AI chat and emotion analysis | **Server-side Supabase Edge Function secret; used by `openrouter-chat`.** Do not place this value in `.env.local` under a `VITE_` name or expose it in the browser. |
| `MISTRAL_API_KEY` | Mistral provider key | Server-side secret; optional in the template and not used by the current application code. |
| `XAI_API_KEY` | xAI provider key | Server-side secret; optional in the template and not used by the current application code. |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI provider key | Server-side secret; optional in the template, with an endpoint mentioned in `.taskmaster/config.json`. That config file is not present, and no Azure OpenAI integration is referenced by the current code. |
| `OLLAMA_API_KEY` | Authentication for a remote Ollama server | Server-side secret; optional in the template and not used by the current application code. |
| `GITHUB_API_KEY` | GitHub import/export features | Server-side secret; optional in the template and not used by the current application code. |

Only variables prefixed with `VITE_` are intended for the client bundle; values with that prefix must be treated as visible to users. Provider keys belong in a server-side secret store. Supabase Edge Functions also refer to platform-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` values; never expose the service-role key to the frontend.

## Available Commands

These are the scripts defined in `package.json`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production frontend into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |

There is no test script defined in `package.json`.

## Supabase Setup

1. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
2. Apply the SQL files in `supabase/new-migrations/` in filename order using the Supabase SQL Editor. They define the core user, ticket, conversation, and message schema, Row Level Security policies, name-reveal support, message policies, and the `sender_role` column.
3. **Review the peer-request schema before using peer matching.** The Edge Functions call a `match_requests` table, but none of the SQL files in this repository creates that table. The migrations also live under `new-migrations/`, not Supabase CLI's default `migrations/` directory; they will not be picked up automatically by a normal migration push. Do not assume a fresh Supabase project is fully provisioned for peer-request operations from these SQL files alone.
4. Deploy the Edge Functions used by the application. The repository includes:

   ```text
   accept-match-request
   create-conversation
   create-match-request
   create-ticket
   decline-match-request
   list-match-requests
   list-tickets
   openrouter-chat
   send-ai-message
   send-message
   update-match-request-status
   withdraw-ticket
   ```

   The Supabase CLI is listed as a project development dependency. For example, after configuring the CLI for your project, the OpenRouter function can be deployed with:

   ```bash
   npx supabase functions deploy openrouter-chat --project-ref <project-ref>
   ```

   Deploy the other function directories in the same way. This repository does not include `supabase/config.toml`, so initialize/configure the local CLI project if your CLI workflow requires it.
5. Add the OpenRouter key as an Edge Function secret, not as a browser variable:

   ```bash
   npx supabase secrets set OPENROUTER_API_KEY=<your-openrouter-key> --project-ref <project-ref>
   ```

   The AI chat and analysis paths use the `openrouter-chat` function and the `qwen/qwen-2.5-72b-instruct` model. A missing secret causes that function to return an unavailable response.

## AI Integrations

The implemented AI integration is OpenRouter. The frontend invokes the `openrouter-chat` Supabase Edge Function, which calls OpenRouter with the `qwen/qwen-2.5-72b-instruct` model. It is used for conversational responses and structured message analysis. The OpenRouter key is read by the Edge Function from its server-side environment.

Although `.env.example` lists keys for Anthropic, Perplexity, OpenAI, Google Gemini, Mistral, xAI, Azure OpenAI, and Ollama, the current app code does not reference those provider integrations. Their presence in the template should not be taken as evidence that they are supported or enabled.

## Screenshots

Screenshots have not been added yet. Replace these placeholders when images are ready:

| Screen | Screenshot |
| --- | --- |
| Sign-in and onboarding | _Screenshot to be added_ |
| Home and AI companion chat | _Screenshot to be added_ |
| Peer support requests and inbox | _Screenshot to be added_ |

## Future Improvements

- Add and document the missing `match_requests` schema and policies, and organize SQL files into a reproducible migration workflow.
- Add automated tests for authentication, peer requests, messaging, and AI error handling.
- Provide clearer consent, retention, and deletion controls for sensitive profile and conversation data.
- Review and strengthen server-side moderation, rate limiting, and crisis-response guidance.
- Add production deployment and monitoring instructions.

## Security and Privacy

- Keep `.env.local` and all provider credentials out of version control. The repository's `.gitignore` excludes local `.env` files; keep `.env.example` limited to empty placeholders.
- Treat every `VITE_` variable as public. Never put an OpenRouter, service-role, or other private API key in a `VITE_` variable.
- Store `OPENROUTER_API_KEY` and other private credentials in the appropriate Supabase Edge Function secret store.
- Review Row Level Security policies and Edge Function authorization before deploying. The browser anon key is not a substitute for database access controls.
- User profiles and conversations may contain sensitive mental-health information. Limit access, apply appropriate retention and deletion practices, and disclose to users that AI messages are sent to the configured third-party AI provider.
- The included client-side content checks are limited and should not be relied on as a comprehensive safety or moderation system.

## Disclaimer

MindSpace is intended for general mental wellness and peer support. It is not a medical device, diagnostic tool, therapist, or substitute for professional medical or mental-health care. AI responses and generated analysis may be inaccurate and should not be used to make clinical decisions. If you or someone else may be in immediate danger, contact local emergency services or a qualified crisis-support service.

## Author

**Aditya Kumar** · [GitHub](https://github.com/aditya001s)

## License

No license has been specified in the repository.
