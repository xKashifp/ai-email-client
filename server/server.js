import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import { testImapConnection, fetchLatestEmails } from './imapService.js';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini API setup will be done per-request using native fetch

// --- API ROUTES ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Universal Email API is running' });
});

// 2. Accounts: List configured accounts
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT id, provider, email FROM accounts').all();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// 3. AI: Generate Summary for an email
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { emailBody } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'Gemini API key is missing.' });

    const prompt = `Summarize the following email in 2-3 concise bullet points. Highlight any required action items.\n\nEmail:\n${emailBody}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Gemini API Error:", errData);
      return res.status(500).json({ error: 'Failed to generate summary' });
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;
    res.json({ summary });
  } catch (error) {
    console.error('AI Summarization Error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// 4. AI: Generate Draft Reply
app.post('/api/ai/draft', async (req, res) => {
  try {
    const { emailContext, tone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'Gemini API key is missing.' });

    const prompt = `Write a reply to the following email using a "${tone}" tone. Keep it professional but concise.\n\nEmail Context:\n${emailContext}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Gemini API Error:", errData);
      return res.status(500).json({ error: 'Failed to generate draft' });
    }

    const data = await response.json();
    const draft = data.candidates[0].content.parts[0].text;
    res.json({ draft });
  } catch (error) {
    console.error('AI Draft Error:', error);
    res.status(500).json({ error: 'Failed to generate draft' });
  }
});
// 5. Accounts: Add new IMAP account
app.post('/api/accounts/add', async (req, res) => {
  try {
    const { email, password, host, port } = req.body;
    
    // 1. Test connection first
    await testImapConnection(host, port, email, password);
    
    // 2. Save to database
    const id = crypto.randomUUID();
    // In a real app, hash the password! For demo, we store it raw (or base64) to use it
    const stmt = db.prepare('INSERT INTO accounts (id, provider, email, imap_host, imap_port, encrypted_password) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, 'imap', email, host, parseInt(port), Buffer.from(password).toString('base64'));

    res.json({ success: true, accountId: id });
  } catch (error) {
    console.error('Add Account Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to add account' });
  }
});

// 6. Emails: Fetch from IMAP
app.post('/api/emails/fetch', async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    const pass = Buffer.from(account.encrypted_password, 'base64').toString('utf8');
    
    const emails = await fetchLatestEmails(account.imap_host, account.imap_port, account.email, pass);
    
    // Save emails to DB
    const insertStmt = db.prepare('INSERT OR IGNORE INTO emails (id, account_id, provider_id, subject, sender_name, sender_email, snippet, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    const insertMany = db.transaction((msgs) => {
      for (const msg of msgs) {
        insertStmt.run(crypto.randomUUID(), accountId, msg.provider_id, msg.subject, msg.sender_name, msg.sender_email, msg.snippet, msg.date.toISOString());
      }
    });
    insertMany(emails);

    res.json({ success: true, count: emails.length, emails });
  } catch (error) {
    console.error('Fetch Emails Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// 7. Emails: Get stored emails
app.get('/api/emails', (req, res) => {
  try {
    const emails = db.prepare('SELECT * FROM emails ORDER BY date DESC').all();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emails from database' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is not set in .env");
  }
});
