import db from './db.js';
import { fetchLatestEmails } from './imapService.js';

async function run() {
  const account = db.prepare('SELECT * FROM accounts LIMIT 1').get();
  if (!account) {
    console.log("No accounts found in DB!");
    return;
  }
  const pass = Buffer.from(account.encrypted_password, 'base64').toString('utf8');
  console.log(`Testing IMAP fetch for ${account.email}...`);
  try {
    const emails = await fetchLatestEmails(account.imap_host, account.imap_port, account.email, pass);
    console.log(`✅ SUCCESS! Found ${emails.length} emails.`);
    if (emails.length > 0) {
      console.log("First email subject:", emails[0].subject);
    } else {
      console.log("⚠️ No emails found in INBOX. Are you sure your inbox has emails?");
    }
  } catch (err) {
    console.error("❌ ERROR FETCHING:", err);
  }
}
run();
