import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, host, port } = req.body;

  if (!email || !password || !host || !port) {
    return res.status(400).json({ error: 'Missing required fields: email, password, host, port' });
  }

  const client = new ImapFlow({
    host,
    port: parseInt(port),
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false }
  });

  const emails = [];

  try {
    await client.connect();

    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true });
      const total = status.messages;

      if (total > 0) {
        const start = Math.max(1, total - 9);
        for await (let msg of client.fetch(`${start}:*`, { source: true, flags: true })) {
          const parsed = await simpleParser(msg.source);
          emails.push({
            id: `imap-${msg.uid}`,
            provider_id: msg.uid.toString(),
            subject: parsed.subject || '(No Subject)',
            sender_name: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address || 'Unknown',
            sender_email: parsed.from?.value[0]?.address || 'unknown@example.com',
            snippet: parsed.text ? parsed.text.substring(0, 500).replace(/\n/g, ' ') : 'No content',
            date: (parsed.date || new Date()).toISOString(),
            is_unread: !msg.flags.has('\\Seen') ? 1 : 0
          });
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    return res.status(200).json({
      success: true,
      accountId: `live-${Date.now()}`,
      emails: emails.reverse()
    });

  } catch (err) {
    console.error('IMAP Error:', err.message);
    return res.status(400).json({
      error: err.message.includes('auth') || err.message.includes('LOGIN')
        ? 'Authentication failed. For Gmail, use an App Password (not your regular password).'
        : `Connection failed: ${err.message}`
    });
  }
}
