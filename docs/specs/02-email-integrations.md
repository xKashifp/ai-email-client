# Email Integrations Specification

## 1. Goal
Provide unified access to Gmail, Office 365, and generic IMAP email providers in a single inbox view.

## 2. Supported Protocols & Libraries
- **Gmail:** `googleapis` (Google REST API).
- **Office 365:** `@microsoft/microsoft-graph-client` (Microsoft Graph REST API).
- **IMAP Providers (Yahoo, AOL, Custom):** `imapflow` (modern async IMAP client) and `mailparser`.

## 3. Implementation Details

### 3.1 Data Normalization
Each provider returns data in a different format. We will create a `StandardEmail` interface:
```typescript
interface StandardEmail {
  id: string;
  provider: 'gmail' | 'office365' | 'imap';
  accountId: string; // To differentiate multiple accounts
  subject: string;
  sender: { name: string, email: string };
  date: string;
  bodySnippet: string;
  fullBodyHtml?: string;
  fullBodyText?: string;
  isUnread: boolean;
  folder: string; // normalized (inbox, sent, archive, trash)
  attachments: boolean;
}
```

### 3.2 Authentication Flows
1. **Gmail/Office365:** User clicks "Add Account". App redirects to OAuth consent screen. Upon return, the authorization code is exchanged for access and refresh tokens. Tokens are encrypted and stored in local SQLite.
2. **IMAP:** User provides email, password/app-password, IMAP host, and port. Credentials are encrypted and stored.

### 3.3 Sync Strategy
- **Initial Sync:** Fetch the last 50 emails from the inbox.
- **Background Sync:** A Service Worker or background process polls endpoints every 5 minutes or listens via IMAP IDLE.
- **Action Syncing:** Actions like archive/delete update local state immediately (Optimistic UI) and queue a background task to update the remote server.
