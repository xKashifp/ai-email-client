import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

async function listModels() {
  console.log("Fetching available models...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ AVAILABLE MODELS:");
      const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      generateModels.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.error("❌ Error response:", data);
    }
  } catch (err) {
    console.error("Failed to fetch:", err);
  }
}

listModels();
