const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Anthropic = require("@anthropic-ai/sdk");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an expert meeting analyst. Given a meeting transcript, extract and return a structured summary in this EXACT format — no extra text, no markdown headers, just these three labeled sections:

SUMMARY:
- [concise bullet point]
- [concise bullet point]
- [concise bullet point]

ACTION ITEMS:
- [Owner name if mentioned]: [task description] — [deadline if mentioned]

OPEN QUESTIONS:
- [unresolved question or blocker]

Rules:
- Only include what was actually discussed. Do not invent details.
- If no action items exist, write "ACTION ITEMS:\n- None identified."
- If no open questions exist, write "OPEN QUESTIONS:\n- None identified."
- Keep bullets short and scannable.`;

function extractText(response) {
  if (!response || !Array.isArray(response.content)) {
    return "";
  }
  return response.content
    .filter((part) => part && part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/summarize", async (req, res) => {
  try {
    const transcript = typeof req.body?.transcript === "string" ? req.body.transcript.trim() : "";

    if (!transcript || transcript.length < 20) {
      return res.status(400).json({ error: "Transcript too short." });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set.");
      return res.status(500).json({ error: "Server misconfigured." });
    }

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Summarize this meeting transcript:\n\n${transcript}`,
        },
      ],
    });

    const text = extractText(response);

    if (!text) {
      return res.status(500).json({ error: "Something went wrong." });
    }

    return res.status(200).json({ summary: text });
  } catch (error) {
    console.error("Summarize failed:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
