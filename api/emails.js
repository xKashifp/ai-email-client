export default function handler(req, res) {
  // Return mock emails for the Vercel demo deployment
  const mockEmails = [
    {
      id: "demo-1",
      sender_name: "OpenAI Team",
      sender_email: "noreply@openai.com",
      subject: "Important updates to your API usage",
      snippet: "Hello Developer,\n\nWe are writing to let you know about upcoming changes to our API pricing structure and new models being released next month.\n\nEffective November 1st, we will be transitioning all legacy models to our new unified pricing tiers. In addition, we are releasing the new v2 endpoints which provide faster inference times and structured JSON outputs natively.\n\nAction Required: Please review your current integrations and migrate any v1 endpoint usage to v2 before November 30th. Legacy endpoints will be deprecated after this date.\n\nBest,\nThe OpenAI Team",
      date: new Date().toISOString()
    },
    {
      id: "demo-2",
      sender_name: "GitHub",
      sender_email: "noreply@github.com",
      subject: "Your repository was starred ⭐",
      snippet: "Hi there,\n\nYour repository ai-email-client just received a new star! You now have 5 stars total.\n\nKeep up the great work!\n\nThe GitHub Team",
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "demo-3",
      sender_name: "Vercel",
      sender_email: "no-reply@vercel.com",
      subject: "Your deployment is live 🚀",
      snippet: "Your project has been successfully deployed to production.\n\nProject: ai-email-client\nDomain: ai-email-client.vercel.app\nStatus: Ready\n\nVisit your deployment at the URL above.\n\nThe Vercel Team",
      date: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  res.status(200).json(mockEmails);
}
