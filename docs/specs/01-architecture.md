# Architecture Specification

## 1. Overview
The AI-first universal email client is a progressive web application (PWA) designed for mobile-first usage. It acts as an aggregator for Gmail, Office 365, and standard IMAP accounts, enriching the email experience with AI capabilities like summarization, draft generation, and intelligent prioritization.

## 2. Technology Stack
- **Frontend Framework:** React + Vite (or Next.js depending on the backend needs).
- **Styling:** Tailwind CSS + Lucide React for iconography.
- **State Management:** Zustand (for lightweight global state, managing multiple email accounts).
- **Service Worker / PWA:** Workbox (via Vite PWA plugin) to cache the application shell and offline capabilities.
- **Backend/API Layer:** Node.js (Express or Next.js API Routes).
- **Database:** SQLite (local persistent storage for user tokens, account info, and cached metadata).
- **AI Provider:** Google Gemini API.

## 3. Core Modules
### 3.1 Authentication & Account Management
- OAuth2 flows for Google and Microsoft.
- Secure credential storage (AES encryption for IMAP passwords in SQLite).
- Unified Inbox state merger (combining threads from multiple providers).

### 3.2 Email Sync Engine
- Background sync mechanism to poll/listen for new emails.
- IMAP IDLE support for real-time notifications where applicable.

### 3.3 AI Orchestrator
- **Summarization:** Passes email body to Gemini for a concise 2-sentence summary.
- **Draft Generation:** Uses context of the thread and user prompts to generate replies.
- **Prioritization:** Classifies incoming emails into High/Medium/Low priority based on sender, content, and historical interactions.

## 4. Multi-Agent Workflow
- **Spec Writer Agent:** Defines feature requirements in `docs/specs`.
- **Frontend Agent:** Implements React components.
- **Backend Agent:** Implements IMAP/OAuth integrations.
- **QA Agent:** Writes and executes automated tests.
