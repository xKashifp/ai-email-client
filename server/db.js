import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'mailclient.db'), { verbose: console.log });

// Create schema if it doesn't exist
function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL, -- 'gmail', 'office365', 'imap'
      email TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      imap_host TEXT,
      imap_port INTEGER,
      encrypted_password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      account_id TEXT,
      provider_id TEXT, -- ID from the provider (e.g., Gmail Message ID)
      subject TEXT,
      sender_name TEXT,
      sender_email TEXT,
      snippet TEXT,
      date DATETIME,
      is_unread INTEGER DEFAULT 1,
      folder TEXT DEFAULT 'inbox',
      ai_summary TEXT,
      ai_priority TEXT,
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    );
  `);
  console.log("✅ Database schema initialized.");
}

initializeDB();

export default db;
