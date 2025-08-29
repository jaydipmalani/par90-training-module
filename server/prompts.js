/*
Optional OpenAI enrichment helper.
If OPENAI_API_KEY is set in the environment, the server will attempt to call OpenAI
to make CSR replies and action plans more natural. This is a best-effort enrichment.
*/

import OpenAI from "openai";

export async function createOpenAIReply(apiKey, {scenarioId, conversation, managerMessage, csrReply, feedback}) {
  if (!apiKey) throw new Error("Missing API key");
  const client = new OpenAI({apiKey});
  const system = `You are a concise internal coaching assistant for retail branch managers helping reduce PAR90. Keep replies brief (1-3 sentences).`;

  const messages = [
    {role: "system", content: system},
    {role: "user", content: `Scenario: ${scenarioId}. Manager message: ${managerMessage}. Current CSR reply (rule-based): ${csrReply}. Coaching feedback: ${JSON.stringify(feedback)}. Produce a more natural CSR reply consistent with score ${feedback.score}. Also, propose a single 2-line action plan item.`}
  ];

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini", // placeholder; users can change model
    messages,
    max_tokens: 200,
    temperature: 0.7
  });

  const text = resp?.choices?.[0]?.message?.content || "";
  // Try to split into reply and action
  const parts = text.split("\n\n");
  return {
    csrReply: parts[0] || text,
    suggestedPlan: parts.slice(1).join("\n\n")
  };
}
