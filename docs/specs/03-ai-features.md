# AI Features Specification

## 1. Goal
Integrate generative AI (Google Gemini API) to reduce email fatigue and improve reply efficiency.

## 2. Capabilities

### 2.1 Smart Summarization
- **Trigger:** Automatic upon opening a long email thread, or batched for the daily digest.
- **Prompt Logic:** "Summarize the following email thread into 2-3 concise bullet points, highlighting any action items."
- **Storage:** Summaries are cached locally in SQLite tied to the email ID to save API tokens.

### 2.2 Contextual Draft Replies
- **Trigger:** User clicks on "Draft Reply" buttons at the bottom of an email.
- **Workflow:** 
  1. User selects a tone (e.g., "Acknowledge", "Push Back", "Ask for Details").
  2. The email body and tone are sent to Gemini.
  3. The response is loaded into the composer text area, allowing the user to edit before sending.

### 2.3 Intelligent Prioritization
- **Trigger:** During email sync.
- **Logic:** New emails are evaluated based on sender (is it a newsletter, an automated alert, or a real person?) and content.
- **Outcome:** Emails are tagged as `High Priority`, `Normal`, or `Low` and visually sorted in the "Focused Inbox" view.
