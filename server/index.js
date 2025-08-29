import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import { evaluateManagerMessage, simulateCSRReply, generateActionPlan } from "./rules.js";
import { createOpenAIReply } from "./prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Simple health
app.get("/api/health", (req, res) => res.json({status: "ok"}));

/*
POST /api/coach
Body: {
  scenarioId: string,
  conversation: [{from: "manager"|"csr", text: "..."}],
  managerMessage: "..."
}
Response:
{
  csrReply: "...",
  feedback: {score: 0-100, badge: "Good"|"Needs work", reasons: [...]},
  actionPlan: {items: [...]}
}
*/
app.post("/api/coach", async (req, res) => {
  try {
    const {scenarioId="default", conversation=[], managerMessage=""} = req.body || {};
    // Evaluate manager message
    const feedback = evaluateManagerMessage(managerMessage);
    // Simulate CSR reply (rule-based)
    let csrReply = simulateCSRReply(managerMessage, feedback, scenarioId);

    // Optionally enrich with OpenAI if API key available
    if (process.env.OPENAI_API_KEY) {
      try {
        const enriched = await createOpenAIReply(process.env.OPENAI_API_KEY, {
          scenarioId, conversation, managerMessage, csrReply, feedback
        });
        if (enriched?.csrReply) csrReply = enriched.csrReply;
      } catch (err) {
        console.warn("OpenAI enrich failed:", err.message);
      }
    }

    // Action plan: only when requested by frontend; but return a short one too
    const actionPlan = generateActionPlan(managerMessage, feedback, scenarioId);

    res.json({
      csrReply,
      feedback,
      actionPlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
});

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server started on http://localhost:${PORT}`));
