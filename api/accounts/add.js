export default function handler(req, res) {
  res.status(200).json({
    error: "IMAP account management is not available in serverless/demo mode. Please run the app locally with 'npm run dev' and start the backend server to use this feature."
  });
}
