const chatWindow = document.getElementById("chatWindow");
const managerInput = document.getElementById("managerInput");
const sendBtn = document.getElementById("sendBtn");
const scenarioSelect = document.getElementById("scenarioSelect");
const csrText = document.getElementById("csrText");
const feedbackBadge = document.getElementById("feedbackBadge");
const scoreEl = document.getElementById("score");
const reasonsEl = document.getElementById("reasons");
const generatePlanBtn = document.getElementById("generatePlan");

let conversation = [];

function appendMessage(who, text) {
  const d = document.createElement("div");
  d.className = "msg " + (who==="manager" ? "manager" : "csr");
  d.innerText = (who==="manager" ? "Manager: " : "CSR: ") + text;
  chatWindow.appendChild(d);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setCSRContext(v) {
  if (v==="default") csrText.innerText = "Missed callback; customer uncertain about funds. CSR nervous about pressing.";
  if (v==="noAnswer") csrText.innerText = "No answer; wrong number flagged. Need to verify contact details and reattempt.";
  if (v==="promisedMissed") csrText.innerText = "Customer promised a callback but missed it; CSR missed the follow-up.";
}

scenarioSelect.addEventListener("change", ()=> {
  setCSRContext(scenarioSelect.value);
  conversation = [];
  chatWindow.innerHTML = "";
  feedbackBadge.innerText = "—";
  scoreEl.innerText = "Score: —";
  reasonsEl.innerText = "";
});

sendBtn.addEventListener("click", sendManagerMessage);
managerInput.addEventListener("keydown", (e)=> { if (e.key==="Enter") sendManagerMessage(); });

async function sendManagerMessage() {
  const text = managerInput.value.trim();
  if (!text) return;
  appendMessage("manager", text);
  conversation.push({from:"manager", text});
  managerInput.value = "";
  // show temporary loader
  appendMessage("csr", "Thinking...");
  const resp = await fetch("/api/coach", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      scenarioId: scenarioSelect.value,
      conversation,
      managerMessage: text
    })
  }).then(r => r.json()).catch(err => ({error:err.message}));
  // remove "Thinking..." placeholder (last message if it's the placeholder)
  const msgs = chatWindow.querySelectorAll(".msg");
  if (msgs.length) {
    const last = msgs[msgs.length-1];
    if (last && last.innerText.includes("Thinking")) last.remove();
  }
  if (resp.error) {
    appendMessage("csr", "Error: " + resp.error);
    return;
  }
  appendMessage("csr", resp.csrReply || "—");
  conversation.push({from:"csr", text: resp.csrReply || ""});
  // update feedback
  feedbackBadge.innerText = resp.feedback.badge;
  scoreEl.innerText = "Score: " + resp.feedback.score;
  reasonsEl.innerText = resp.feedback.reasons.join(", ");
}

generatePlanBtn.addEventListener("click", async ()=> {
  // use last manager message for plan if available
  const lastManager = [...conversation].reverse().find(c=>c.from==="manager");
  const managerMessage = lastManager?.text || "";
  const resp = await fetch("/api/coach", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      scenarioId: scenarioSelect.value,
      conversation,
      managerMessage
    })
  }).then(r=>r.json());
  // show plan in a modal-like alert (simple)
  const plan = resp.actionPlan;
  const lines = plan.items.map((it,idx)=> `${idx+1}. ${it.title} — ${it.detail} (when: ${it.when}, owner: ${it.owner})`).join("\n\n");
  alert("Action Plan:\n\n" + lines);
});

window.addEventListener("load", ()=> {
  setCSRContext(scenarioSelect.value);
});
