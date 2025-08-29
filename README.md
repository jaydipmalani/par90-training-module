# PAR90 Training Module — AI-powered interactive demo

**What this is**
A self-contained, local demo that simulates an AI-powered, interactive coaching experience for branch managers to reduce PAR90 (1-90 days past due loans). It's hybrid: rule-based coaching simulation + optional OpenAI integration (if you provide an API key). Includes real-time feedback, coaching scoring, and an action-plan generator.

**What's included**
- `server/` — Node.js Express backend (serves frontend and provides /api/coach)
- `frontend/` — Static single-page app (HTML/JS/CSS) with chat-based coaching simulation
- `README.md` — this file
- `loom_script.txt` — 1–2 minute Loom walkthrough script
- `ASSUMPTIONS.md` — design assumptions and unique heuristics used

**Key features**
- Interactive scenario generator (pick a delinquent customer scenario)
- Simulated CSR replies based on your coaching
- Real-time feedback (Good coaching vs Poor coaching) with a 0–100 score
- Generated concise action plan you can bring back to branch
- Optional OpenAI integration: set `OPENAI_API_KEY` env var to enable LLM-enhanced responses

---

## Quick start (run locally)

Requirements:
- Node.js 18+ and npm
- (Optional) OpenAI API key if you want LLM responses

From project root:

```bash
cd server
npm install
npm start
```

Then open http://localhost:3000 in your browser.

If you want to enable OpenAI:
1. `cd server`
2. `export OPENAI_API_KEY="sk-..."`
3. `npm start`

The server will prefer the rule-based engine but will call OpenAI if the key is present to enrich CSR replies and action plans.

---

## Repo structure (short)
```
/server
  package.json
  index.js
  rules.js
  prompts.js
/frontend
  index.html
  app.js
  styles.css
loom_script.txt
ASSUMPTIONS.md
README.md
```

---

## What to submit to recruiters
1. Zip file (this package) — already provided.
2. Repo link (if you push to GitHub): push these files and include the README above.
3. Loom: record a 1–2 minute walkthrough using `loom_script.txt` as your script.

---

## Notes on originality
To reduce "sounds like ChatGPT", the demo uses bespoke coaching heuristics (see `ASSUMPTIONS.md`) and a small "manager scoring rubric" nobody typically copies. The UI copy is intentionally concise and human-forward.

---

If anything in the zip is missing or you want extra features (Dockerfile, production build, or a deployed demo link), tell me which and I will add them into the zip right away.
