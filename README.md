# AI-First Universal Email Client

A Progressive Web Application (PWA) built for a mobile-first, premium user experience. It aggregates IMAP, Gmail, and Office 365 into a single, unified local-first database, enriching the data layer with generative AI.

**Live Demo:** [https://ai-email-mocha.vercel.app](https://ai-email-mocha.vercel.app) (Frontend UI)

## Features

- **Unified Inbox:** Connect multiple accounts via IMAP into a single interface.
- **AI Summarization:** Get quick bulleted summaries of long emails using Google Gemini API.
- **Smart Drafting:** Generate contextually aware email responses natively inside the composer with varying tones (e.g., Professional, Push Back).
- **Local-First Architecture:** Uses SQLite to store encrypted credentials and cache emails locally, ensuring data privacy.
- **Progressive Web App (PWA):** Installs natively on desktop and mobile, with offline caching for instant loads.
- **Premium Design:** Features a responsive, modern "glassmorphism" UI with dark mode support.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand, Lucide Icons, Vite PWA Plugin
- **Backend:** Node.js, Express, better-sqlite3, imapflow, mailparser
- **AI Integration:** Google Gemini API (2.5-flash)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Google Gemini API Key

### Installation

1. Clone the repository and navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example` and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Application

This project uses concurrent scripts to run both the backend and frontend simultaneously.

Start the development environment:
```bash
npm run dev
```

Alternatively, you can run them separately:
- **Backend:** `npm run dev:backend` (Runs on port 3001)
- **Frontend:** `npm run dev:frontend` (Runs on port 5173)

The `server/db.js` script will automatically initialize the local `mailclient.db` SQLite database when the backend starts.

## Build for Production

To build the project for production:
```bash
npm run build
```

## Deployment Note

Because Vercel (and similar serverless platforms) use a read-only filesystem, the local SQLite database cannot be persisted there directly. The provided live URL serves the React frontend shell primarily to showcase the UI and AI interaction mocks. For a full production deployment, the backend and database should be hosted on a persistent container service (e.g., Render, Railway) or the database migrated to a cloud provider like Turso or Supabase.
