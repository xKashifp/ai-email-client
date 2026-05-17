import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

/**
 * Validates IMAP credentials by attempting to connect and list mailboxes.
 * If successful, it returns true.
 */
export async function testImapConnection(host, port, user, pass) {
  const client = new ImapFlow({
    host,
    port: parseInt(port),
    secure: true,
    auth: { user, pass },
    logger: false // Set to true for debugging
  });

  try {
    await client.connect();
    await client.logout();
    return true;
  } catch (err) {
    console.error("IMAP Connection Failed:", err.message);
    throw new Error("Failed to connect to the email server. Please check your credentials and IMAP settings.");
  }
}

/**
 * Fetches the latest 10 emails from the INBOX.
 */
export async function fetchLatestEmails(host, port, user, pass) {
  const client = new ImapFlow({
    host,
    port: parseInt(port),
    secure: true,
    auth: { user, pass },
    logger: false
  });

  const emails = [];

  try {
    await client.connect();
    
    // Select the inbox
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Fetch the last 10 messages
      // 1:* gets all, so we'll grab messages from the end.
      const status = await client.status('INBOX', { messages: true });
      const totalMessages = status.messages;
      
      if (totalMessages === 0) return [];

      const start = Math.max(1, totalMessages - 9);
      const seqString = `${start}:*`;

      // Fetch headers and body structure
      for await (let msg of client.fetch(seqString, { source: true, envelope: true, flags: true })) {
        // Parse the raw email source
        const parsed = await simpleParser(msg.source);
        
        emails.push({
          provider_id: msg.uid.toString(),
          subject: parsed.subject || '(No Subject)',
          sender_name: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address || 'Unknown Sender',
          sender_email: parsed.from?.value[0]?.address || 'unknown@example.com',
          snippet: parsed.text ? parsed.text.substring(0, 150).replace(/\n/g, ' ') : 'No text content available',
          date: parsed.date || new Date(),
          is_unread: !msg.flags.has('\\Seen') ? 1 : 0
        });
      }
    } finally {
      lock.release();
    }
    await client.logout();
    
    // Return newest first
    return emails.reverse();
  } catch (err) {
    console.error("IMAP Fetch Failed:", err);
    throw err;
  }
}
