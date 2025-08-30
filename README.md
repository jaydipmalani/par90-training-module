# PAR90 Training Module — Detailed README

This is a local demo that helps branch managers practice coaching CSRs to reduce **PAR90** (loans 1–90 days past due). It's designed for interviews, demos, and quick local testing. The project uses a simple rule engine (deterministic) and can optionally call OpenAI to improve wording or generate human-friendly text.


---

## Short summary (one line)
A small Node + React demo that scores manager messages with simple rules and optionally uses the OpenAI API to paraphrase / enrich outputs.

---

## What’s in this repo
- `server/` — Node backend. Holds the rule engine and the API that the frontend calls.
  - `server/index.js` — server entry point and routes (where OpenAI calls happen if enabled).
  - `server/rules.js` — deterministic rules, scoring functions, and action-plan generator.
- `frontend/` — React app (UI to run coaching scenarios and view scores/action plans).
- `.env` — environment variables (not checked into git). Put your secrets here.
- `README.md` — this file.
- Other scripts and config files (`package.json`, etc.).

---

## Tech stack
- Backend: **Node.js** (v14+ or v16+ recommended). Express or a tiny HTTP server.
- Frontend: **React** (HTML. CSS, JavaScript).
- Optional AI: **OpenAI API** (server-only calls). The app still works without it, using the rule engine only.

---

## How it works — simple explanation
1. The frontend sends a manager message (text) or a scenario selection to the backend.
2. The backend's `rules.js` runs a set of checks on the message. These checks look for expected phrases or behaviors:
   - Example: `scorePresence(text, ["log every callback", "pick two customers"])` — if the manager mentions those things, the rule awards points.
3. The rules produce:
   - A numeric score or category (e.g., `meets_expectations`, `needs_improvement`).
   - A short action plan with clear next steps for the CSR (e.g., "Log every callback, update reasons, call top 5 by 3pm").
4. If OpenAI is enabled and a key is present in `.env`, the server can send the rule-generated results to OpenAI to:
   - Reword the action plan to sound friendlier (soften tone, add empathy).
   - Generate alternative phrasing for practice or training.
   - **Important:** OpenAI results are only enrichment — the rule score and rationale remain the authoritative output.

This keeps the tool auditable (you can always inspect `rules.js` to see why the score was given).

---

## Rules & prompts — more detail
- The rule engine is intentionally simple and easy to read. Typical parts:
  - **Pattern lists** — arrays of phrases to match (exact substring or lowercased contains check).
  - **`scorePresence(text, patterns)`** — counts matches and awards partial or full points.
  - **Thresholds** — a sum of points maps to statuses (e.g., 0–40% = needs work, 40–60% = okay, 60–100% = good).
  - **Action plan builder** — turns missing items into concrete tasks: "Log callback", "Confirm promised callbacks", etc.
- Where to change rules: edit `server/rules.js`. Keep logic deterministic: avoid random or ML-only decisions in the scoring function if you want reproducible results for interviews.


---

## .env and OpenAI usage
First you need to duplicate .env.example file with .env in server (because .env file is nt allowed to push in git repo)
You put the OpenAI key in the `.env` file. Good. Here is the recommended format and how the app uses it:

**`.env` (example)**
```
PORT=3000
OPENAI_ENABLED=true
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY(Currently its xxxxxxxxxx)
```
- `OPENAI_API_KEY` — your secret key. Keep it private. Do **not** commit `.env` or push the key.
- `OPENAI_ENABLED` — set to `false` or remove the key to run in rule-only mode.
- The server reads `process.env.OPENAI_API_KEY` and `process.env.OPENAI_ENABLED` at startup. If the key is missing or `OPENAI_ENABLED` is false, the server will skip any OpenAI calls.


---

## How to run (common steps)
1. In `.env` add `OPENAI_API_KEY` if you want enrichment.
2. In server: (`Example path : C:\Users\JAYDIP\OneDrive\Desktop\par90-training-module\server>`)
   - do `npm start` 
4. Open the frontend in a browser (`http://localhost:3000`).

---

## Common problems & quick fixes
- **Port 3000 already in use (EADDRINUSE)**:
  - Windows (PowerShell): Do this (`Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force`)
- **OpenAI 429 quota errors**: your key might be out of quota. Check your OpenAI account and usage, or set `OPENAI_ENABLED=false` to skip calls while testing.
- **CORS / frontend cannot reach backend**: ensure the server port matches the frontend proxy or CORS config. Check `package.json` in `frontend` for `proxy` settings or verify CORS headers in the server responses.
- **`npm start` fails**: check `server/index.js` for errors shown in console. Run `node server/index.js` directly to see stack traces.

---

## Where to look in code for specific things
- Scoring logic and rules: `server/rules.js`
- API endpoints / OpenAI calls: `server/index.js` (search for `OPENAI_API_KEY` usage)
- Dev scripts and run commands: `package.json` in project root and in `server/` and `frontend/`
- Example scenarios: `frontend/src` (look for `scenarios`, `examples`, or `data` folders)

---

## Example scenario (what you might test)
1. Open the UI and pick the “missed callbacks” scenario.
2. Paste this manager message:
   > "Thanks for raising this — I know it’s hard when customers don’t answer. How are you deciding which times to call, and what usually happens when they miss? Let’s schedule two follow-ups today at specific times and log them in the tracker. I’ll check the tracker at 3pm, and tomorrow we’ll review the top 5 at-risk customers together."
3. Server scores the message. Expected result: high score for logging + scheduling + specific follow-up.
4. If OpenAI is enabled, you’ll also get an enriched version of the action plan phrased more empathetically for the CSR.

---

## Assumptions I made writing this README
- Project is a two-folder repo (`server/` + `frontend/`) using Node + React.
- The deterministic rule engine is in `server/rules.js` and is the primary source of truth.
- OpenAI is called only server-side and only when enabled via `.env`.
- The demo runs locally for interviews/demos, not production deployment.

---

