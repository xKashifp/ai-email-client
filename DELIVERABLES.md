# Assessment Deliverables: AI-First Universal Email Client

**Live Vercel URL:** `https://ai-email-oznta7r8s-xkashifps-projects.vercel.app`
*(Production Domain: `ai-email-mocha.vercel.app`)*

*(Note for deployment: Since Vercel uses a read-only serverless filesystem, the local SQLite database must be swapped to an external DB like Supabase/Neon, or the Vite frontend can be deployed alone to showcase the beautiful UI and AI interaction mocks).*

---

## 1. CLAUDE.md (System Instructions & Identity)
```markdown
# Claude Code CLI - Agent OS System Prompt & Instructions

## Role & Identity
You are an expert AI software engineer, part of a multi-agent workflow designed to build and maintain the "AI-first Universal Email Client PWA". You follow the Agent OS methodology, adhering strictly to specs-driven development.

## Tech Stack
- Frontend: Vite (PWA configured), React, Tailwind CSS.
- Backend: Node.js, Express.
- Database: SQLite (local local-first credential/cache storage).
- Email Protocols: IMAP (imapflow).
- AI: Google Gemini API (2.5-flash).

## Workflow (Specs-Driven Dev)
1. Always check `docs/specs/` for the current feature's specification.
2. If a spec is missing or ambiguous, pause and ask the user or write the spec first for approval.
3. Use the tools provided in `skills/` to validate your work.
4. Update `task.md` with your progress.

## Coding Standards
- Write clean, modular React components.
- Prioritize visual excellence (glassmorphism, dark mode, smooth animations).
- Ensure all interactive elements are responsive and touch-friendly.
```

---

## 2. One-Page Architecture Doc

### Overview
The AI-first Universal Email Client is a Progressive Web Application (PWA) built for a mobile-first, premium user experience. It aggregates IMAP, Gmail, and Office 365 into a single, unified local-first database, enriching the data layer with generative AI.

### Frontend Engine (Vite + React)
- **State & UI:** React handles state management while Tailwind CSS delivers a high-fidelity "glassmorphism" design system tailored for dark mode.
- **PWA Capabilities:** Configured with `vite-plugin-pwa` to cache the application shell locally, ensuring instant loads even offline.

### Backend Orchestrator (Node.js + Express)
- **Email Sync Service:** Uses `imapflow` and `mailparser` to securely stream emails from external providers via standard IMAP.
- **Data Persistence:** Uses `better-sqlite3` to store encrypted OAuth/App passwords and cache email payloads locally, ensuring user data never leaves their machine except when querying AI.

### AI Integration Layer (Google Gemini)
- The backend serves as a secure proxy to the `gemini-2.5-flash` model. 
- **Summarization Pipeline:** Extracts the raw text snippet from `mailparser`, injects it into a strict few-shot prompt, and streams a bulleted summary back to the UI.
- **Drafting Pipeline:** Evaluates the email context alongside user-selected tones (e.g., "Professional", "Push Back") to generate contextually aware responses natively inside the composer.

---

## 3. List of Agents, Skills, Hooks, and Plugins

### Agents
1. **Architecture Agent:** Responsible for drafting `docs/specs/01-architecture.md` and dictating the Node.js/SQLite vs Next.js decision trees.
2. **UI/UX Agent:** Specialized in Tailwind CSS. Executed the frontend React layout, dark mode palette, and mobile responsiveness.
3. **Backend/Integration Agent:** Implemented `server.js`, `imapService.js`, and the Google Gemini fetch integrations.

### Skills & Plugins
- **`skills/verify-build.js`**: A custom Node script executed by the agents before declaring a task complete. It programmatically runs ESLint and the TypeScript compiler to ensure the project builds correctly without human intervention.
- **`vite-plugin-pwa`**: A Vite plugin hooked into the build step to automatically generate Service Workers and manifest files for the Progressive Web App.

---

## 4. Short Workflow Writeup

This project was built using the **Agent OS methodology** combined with strict **specs-driven development**. 

Before a single line of code was written, the core architecture and feature requirements (Email integrations and AI features) were documented in `docs/specs/`. A `CLAUDE.md` file was established immediately to give the AI agents strict boundaries on technology choices (React, Vite, Express, SQLite, Gemini) and design aesthetics (premium dark mode, glassmorphism). 

During development, tasks were divided sequentially. The UI/UX Agent mocked the frontend shell based on the specs. Once visually approved, the Backend Agent replaced the mock data by standing up an Express server and SQLite database, establishing the IMAP connection bridge, and routing the AI summary prompts through the Gemini 2.5 Flash model. The workflow was guided by a centralized `task.md` checklist, ensuring no requirements (like multi-account support and PWA configuration) were missed.

---

## 5. Implementation Procedure

If you need to outline exactly how to deploy or run this software, here is the official implementation procedure:

**Phase 1: Local Environment Setup**
1. Ensure Node.js (v18+) is installed on the host machine.
2. Run `npm install` in the root directory to fetch all frontend and backend dependencies.
3. Create a `.env` file in the root directory and securely inject the `GEMINI_API_KEY`.

**Phase 2: Database & Backend Initialization**
1. Execute `npm run dev:backend`. 
2. The `server/db.js` script will automatically execute, creating the local `mailclient.db` SQLite file and provisioning the `accounts` and `emails` tables if they do not exist.
3. The Express server begins listening on port 3001, establishing the IMAP and AI routing gateways.

**Phase 3: Frontend PWA Bootstrapping**
1. Execute `npm run dev:frontend`.
2. Vite compiles the React code, bundles the Tailwind CSS tokens, and registers the PWA Service Worker via `vite-plugin-pwa`.
3. The UI boots on port 5173, immediately polling the local SQLite database for cached emails via the backend bridge.

**Phase 4: Vercel Deployment (Optional/Mocked)**
1. To deploy the UI to Vercel, push the repository to GitHub.
2. Link the repository to a new Vercel project.
3. *Crucial:* Because Vercel does not support persistent SQLite databases in its serverless environment, the Vercel deployment strictly serves the React frontend shell. The backend must either be hosted on a persistent container service (like Render/Railway) or the frontend must be configured to use mock data for the Vercel demonstration.
