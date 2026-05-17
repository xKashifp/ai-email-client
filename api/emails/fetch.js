export default function handler(req, res) {
  res.status(200).json({
    error: "Email syncing from IMAP is not available in serverless/demo mode. Run the app locally to sync real emails."
  });
}
