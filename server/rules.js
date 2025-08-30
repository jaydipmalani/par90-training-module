/*
rules.js
Rule-based engine for evaluating manager messages, simulating CSR replies, and generating an action plan.
This deterministic logic is the "secret sauce" — interviewers can read and verify it easily.
*/

function scorePresence(text, patterns) {
  text = (text||"").toLowerCase();
  let matched = 0;
  for (const p of patterns) {
    if (text.includes(p)) matched++;
  }
  return matched;
}


function matchCount(text, keywords) {
  if (!text) return 0;
  let cnt = 0;
  for (const kw of keywords) {
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = '\\b' + escaped.replace(/\s+/g, '\\s+') + '\\b';
    const re = new RegExp(pattern, 'i');
    if (re.test(text)) cnt++;
  }
  return cnt;
}


export function evaluateManagerMessage(text) {
  text = (text || "").trim();
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s?'"]/g, ' ').replace(/\s+/g, ' ').trim();

  // Keyword lists (expand as you like)
  const empathyKeywords = [
    "i understand", "i'm sorry", "sorry", "understand", "tough", "hard", "i get it",
    "that sounds", "i can imagine", "i know"
  ];
  const openQuestionKeywords = [
    "how", "what", "why", "can you tell", "help me understand", "could you", "would you"
  ];
  const concreteKeywords = [
    "by", "when", "call back", "schedule", "commit", "set a time", "follow up", "today", "tomorrow", "next"
  ];
  const accountabilityKeywords = [
    "i will", "we'll", "we will", "you will", "let's", "lets agree", "i'll check", "i will check", "assign", "manager to review"
  ];
  const positiveKeywords = ["thanks", "thank you", "appreciate", "good", "great", "let's work"];
  const negativeKeywords = ["why didn't", "you didn't", "fail", "never", "shame", "blame", "should have", "should've"];

  const qmCount = (text.match(/\?/g) || []).length;
  const openCount = qmCount + matchCount(normalized, openQuestionKeywords);

  // Score allocation (keeps the same max totals but gives partial credit per match)
  // Empathy: max 20 pts, 2 match cap ⇒ 10 pts per match
  const empathyHits = matchCount(normalized, empathyKeywords);
  const empathyPts = Math.min(2, empathyHits) * 10;

  // Open questions: max 20 pts, cap 2 ⇒ 10 pts per hit
  const openPts = Math.min(2, openCount) * 10;

  // Concrete next step: max 25 pts, cap 2 ⇒ 12.5 pts per hit
  const nextHits = matchCount(normalized, concreteKeywords);
  const nextPts = Math.min(2, nextHits) * 12.5;

  // Accountability: max 20 pts, cap 2 ⇒ 10 pts per hit
  const accHits = matchCount(normalized, accountabilityKeywords);
  const accPts = Math.min(2, accHits) * 10;

  // Tone: compute (positive - negative) then scale, max 15 pts, cap 2 increments
  const pos = matchCount(normalized, positiveKeywords);
  const neg = matchCount(normalized, negativeKeywords);
  const toneBase = Math.max(0, pos - neg);
  const tonePts = Math.min(2, toneBase) * 7.5; // 0, 7.5, 15

  const rawScores = {
    empathy: empathyPts,
    openQuestions: openPts,
    concreteNextStep: nextPts,
    accountability: accPts,
    tone: tonePts
  };

  const total = Math.round(
    rawScores.empathy + rawScores.openQuestions + rawScores.concreteNextStep + rawScores.accountability + rawScores.tone
  );

  let reasons = [];
  if (rawScores.empathy > 0) reasons.push("Showed empathy");
  if (rawScores.openQuestions > 0) reasons.push("Used open questions");
  if (rawScores.concreteNextStep > 0) reasons.push("Offered a concrete next step");
  if (rawScores.accountability > 0) reasons.push("Set accountability or follow-up");

  const nonEmpathySum = (rawScores.openQuestions || 0) + (rawScores.concreteNextStep || 0) + (rawScores.accountability || 0) + (rawScores.tone || 0);
  if (total < 50 && nonEmpathySum > 0) {
    reasons.push("Consider more collaborative open questions and a clear next step");
  }

  if ((rawScores.empathy || 0) > 0 && nonEmpathySum === 0) {
    reasons = ["Showed empathy"];
  }

  return {
    rawScores,
    score: total,
    badge: total >= 65 ? "Good coaching" : (total >= 40 ? "Mixed" : "Needs work"),
    reasons
  };
}


export function simulateCSRReply(managerMessage, feedback, scenarioId="default") {
  const score = feedback.score || 0;

  // Base templates
  const templates = {
    low: [
      "I tried calling but the customer didn't answer. I wasn't sure what to say and didn't push for a commitment.",
      "I left a generic voicemail. They didn't promise a time to call back."
    ],
    mid: [
      "I explained our options and asked for a good time to call back — they said maybe next week but didn't commit.",
      "The customer said they're checking funds; I asked for a time and they said they'd call back but no firm time."
    ],
    high: [
      "I empathized with the customer, asked what would help, and they committed to call back tomorrow at 10am.",
      "I proposed a short payment plan and scheduled a callback next Tuesday, they confirmed the time."
    ]
  };

  let reply = "";
  if (score < 40) {
    reply = templates.low[Math.floor(Math.random()*templates.low.length)];
    reply += " I was worried about pushing too hard.";
  } else if (score < 65) {
    reply = templates.mid[Math.floor(Math.random()*templates.mid.length)];
    reply += " I can try again if you give me a script.";
  } else {
    reply = templates.high[Math.floor(Math.random()*templates.high.length)];
    reply += " I can confirm and log the callback in the tracker.";
  }

  return reply;
}

export function generateActionPlan(managerMessage, feedback, scenarioId="default") {
  if (!managerMessage || managerMessage.trim() === "") {
    return { items: [] };
  }

  const rs = feedback.rawScores || {};
  const items = [];

  const maxPoints = { empathy: 20, openQuestions: 20, concreteNextStep: 25, accountability: 20, tone: 15 };

  const isEmpathyOnly = (rs.empathy || 0) > 0 &&
                        ((rs.openQuestions || 0) === 0) &&
                        ((rs.concreteNextStep || 0) === 0) &&
                        ((rs.accountability || 0) === 0) &&
                        ((rs.tone || 0) === 0);

  let weaknesses = [];
  if (isEmpathyOnly) {
    weaknesses = ["Open questions", "Concrete next steps", "Accountability"];
  } else {
    if ((rs.empathy||0) < maxPoints.empathy * 0.9) weaknesses.push("Empathy");
    if ((rs.openQuestions||0) < maxPoints.openQuestions * 0.9) weaknesses.push("Open questions");
    if ((rs.concreteNextStep||0) < maxPoints.concreteNextStep * 0.9) weaknesses.push("Concrete next steps");
    if ((rs.accountability||0) < maxPoints.accountability * 0.9) weaknesses.push("Accountability");
  }

  if (weaknesses.length === 0) {
    items.push({
      title: "Next steps",
      detail: "Continue your current coaching approach. Track top 5 at-risk customers and maintain follow-up discipline.",
      when: "Today",
      owner: "Manager"
    });
  } else {
    weaknesses.forEach(w => {
      switch (w) {
        case "Empathy":
          items.push({
            title: "Improve empathy",
            detail: "Use empathetic phrases and acknowledge customer's situation before asking about payments.",
            when: "Today",
            owner: "Manager"
          });
          break;
        case "Open questions":
          items.push({
            title: "Ask open questions",
            detail: "Use questions starting with 'how', 'what', or 'can you tell me' to encourage CSR explanation.",
            when: "Today",
            owner: "Manager"
          });
          break;
        case "Concrete next steps":
          items.push({
            title: "Set concrete next steps",
            detail: "Ensure each call ends with a specific commitment and callback time.",
            when: "Today",
            owner: "Manager"
          });
          break;
        case "Accountability":
          items.push({
            title: "Ensure accountability",
            detail: "Confirm CSR will log callbacks and review top 5 at-risk customers daily.",
            when: "Today",
            owner: "Manager"
          });
          break;
      }
    });
  }

  return { items };
}

